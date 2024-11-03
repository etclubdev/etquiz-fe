import { useState, useEffect, useRef } from "react";
import { Progress, Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorageDecode";
import { Answer, Question } from "../../types/question";
import { encryptData } from "../../utils/encryptData";
import infoApi from "../../apis/info.api";

const Exam = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string | null }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100); // 300 giây tương ứng với 5 phút
  const selectedAnswersRef = useRef(selectedAnswers);
  const navigate = useNavigate();
  const { storedData: studentInfo, setValue: saveStudentInfo, reset } = useLocalStorage("studentInfo");
  const { storedData: questionList } = useLocalStorage("questions");
  const { storedData: answerList } = useLocalStorage("answers");

  const currentAnswers = answerList.filter(
    (answer: Answer) => answer.question_id === questionList[currentQuestion].question_id
  ) as Answer[];
  useEffect(() => {
    // Initialize countdown timer
    const timer = setInterval(() => {
      if (!isModalVisible) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsModalVisible(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isModalVisible]);
  useEffect(() => {
    // Warning on leaving the page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(selectedAnswers).length > 0) {
        e.preventDefault();
        e.returnValue = "Your progress will not be saved if you leave the page!";
        reset();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [reset, selectedAnswers]);

  function calculateScore(questions: Question[], savedAnswers: { [key: string]: string | null }): number {
    let score = 0;

    for (const question of questions) {
      const questionId = question.question_id;
      const userAnswer = savedAnswers[questionId];
      // Check the answer and increase the score
      if (userAnswer && userAnswer === JSON.parse(question.correct_answer)) {
        score++;
      }
    }

    return score;
  }
  const updateResult = async (mssv: string, result: number) => {
    const secretKey = encryptData(mssv);
    const data = await infoApi.updateResult(
      { result },
      {
        secretKey,
      }
    );
    return data;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCalCulateScoreAndSave = async () => {
    const calculatedScore = calculateScore(questionList, selectedAnswersRef.current);
    studentInfo["result"] = calculatedScore;
    saveStudentInfo(studentInfo);
    await updateResult(studentInfo.mssv, calculatedScore);
  };
  useEffect(() => {
    if (timeLeft === 0) {
      try {
        setIsModalVisible(true);
        setTimeout(() => {
          handleCalCulateScoreAndSave();
          navigate("/result");
        }, 5000);
      } catch (err) {
        console.error(err);
      }
    }
  }, [timeLeft, navigate, handleCalCulateScoreAndSave]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleOptionChange = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionList[currentQuestion].question_id]: option,
    });
    selectedAnswersRef.current = {
      ...selectedAnswers,
      [questionList[currentQuestion].question_id]: option,
    }; // Cập nhật selectedAnswers vào ref mỗi khi thay đổi
  };

  const handleNext = () => {
    if (currentQuestion < questionList.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsModalVisible(true);
  };

  const handleConfirmSubmit = () => {
    setIsModalVisible(false);
    try {
      handleCalCulateScoreAndSave();
      setTimeout(() => {
        navigate("/result");
      }, 0);
    } catch (error) {
      console.error(error);
    }
  };

  const completedQuestions = Object.keys(selectedAnswers).length;
  const completionPercentage = Math.floor((completedQuestions / questionList.length) * 100);

  return (
    <div className='flex flex-col w-full max-w-[1300px] justify-center mx-auto p-5'>
      {/* Header */}
      <div className='flex items-center justify-between gap-4'>
        <h1 className='text-xl font-bold'>ET QUIZ TEST</h1>
        <Progress percent={completionPercentage} showInfo={false} strokeColor='#1890ff' />
        <span>{studentInfo.name}</span>
        <span>{formatTime(timeLeft)}</span>
      </div>

      {/* Body */}
      <div className='bg-gray-300 mt-8 flex flex-col justify-center'>
        <div className='py-7 w-full px-20 mx-auto'>
          <h2>Câu hỏi số {currentQuestion + 1}</h2>
          <p className='font-bold text-justify'>{questionList[currentQuestion].question}</p>
          <div className='flex flex-col gap-y-3 mt-5'>
            {currentAnswers.map((option, index) => (
              <div
                key={index}
                className={`flex items-center justify-between py-3 px-5 border-l-4 ${
                  selectedAnswers[questionList[currentQuestion].question_id] === option.answer_id
                    ? "border-l-purple-500 bg-white shadow-lg"
                    : "border-l-transparent"
                }`}
                onClick={() => handleOptionChange(option.answer_id)}
              >
                <span>{option.answer}</span>
                <input
                  type='radio'
                  name={`options-${currentQuestion}`}
                  checked={selectedAnswers[questionList[currentQuestion].question_id] === option.answer_id}
                  onChange={() => handleOptionChange(option.answer_id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nút Prev và Next */}
      <div className='flex justify-between mt-5'>
        <Button onClick={handlePrev} disabled={currentQuestion === 0}>
          Prev
        </Button>
        <Button onClick={handleNext} disabled={currentQuestion === questionList.length - 1}>
          Next
        </Button>
        <Button type='primary' onClick={handleSubmit}>
          Submit
        </Button>
      </div>

      <Modal
        title={
          timeLeft > 0
            ? Object.keys(selectedAnswers).length < questionList.length
              ? "Chưa hoàn thành câu hỏi"
              : "Xác nhận nộp bài"
            : "Hết thời gian"
        }
        visible={isModalVisible}
        // onOk={timeLeft > 0 ? () => handleConfirmSubmit() : undefined}
        onCancel={timeLeft > 0 ? () => setIsModalVisible(false) : undefined}
        footer={
          timeLeft > 0 ? (
            <>
              <button onClick={() => setIsModalVisible(false)}>Cancel</button>
              <button onClick={() => handleConfirmSubmit()}>OK</button>
            </>
          ) : (
            []
          )
        }
        closable={timeLeft > 0}
      >
        {timeLeft > 0 ? (
          Object.keys(selectedAnswers).length < questionList.length ? (
            <p>Có một số câu hỏi chưa hoàn thành, bạn có muốn nộp bài không?</p>
          ) : (
            <p>Bạn đã hoàn thành tất cả câu hỏi, xác nhận nộp bài.</p>
          )
        ) : (
          <p>Hết thời gian. Đang nộp câu trả lời của bạn bây giờ. Bạn sẽ được tự động chuyển sang trang kết quả sau 5s.</p>
        )}
      </Modal>
    </div>
  );
};

export default Exam;
