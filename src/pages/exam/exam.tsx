import { useState, useEffect, useRef } from "react";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorageDecode";
import { Answer, Question } from "../../types/question";
import { encryptData } from "../../utils/encryptData";
import infoApi from "../../apis/info.api";
import "./exam.css";
const Exam = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string | null }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 300 giây tương ứng với 5 phút
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
    return {
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
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

  // const completedQuestions = Object.keys(selectedAnswers).length;
  // const completionPercentage = Math.floor((completedQuestions / questionList.length) * 100);
  const { minutes, seconds } = formatTime(timeLeft);

  return (
    <div className='flex flex-col w-full max-w-[1300px] mx-auto p-5' style={{ backgroundColor: "#080808" }}>
      {/* Header */}
      <div className='flex flex-col md:flex-row items-center justify-between gap-1'>
        <div className='text-[18px] sm:text-xl font-bold text-white'>ET QUIZ TEST</div>

        {/* Timer */}
        <div className='flex flex-col items-center bg-gray-900 rounded-lg text-white px-4 py-2'>
          <h2 className='text-[16px] sm:text-xl font-semibold'>Time Left</h2>
          <div className='flex items-center justify-center gap-2 mt-1 sm:mt-2'>
            <div className='flex justify-center text-xl sm:text-2xl font-bold border border-[#00F801] rounded-lg p-2 min-w-[50px]'>
              {minutes}
            </div>
            <span className='text-xl sm:text-2xl font-bold'>:</span>
            <div className='flex justify-center text-xl sm:text-2xl font-bold border border-[#00F801] rounded-lg p-2 min-w-[50px]'>
              {seconds}
            </div>
          </div>
          <Button type='primary' onClick={handleSubmit} className='bg-[#00F801] w-full mt-1 sm:mt-2 rounded-b-lg font-bold text-black'>
            Submit
          </Button>
        </div>

        {/* Student Info */}
        <div className='text-white mt-1 sm:mt-2 md:mt-0'>{studentInfo.name}</div>
      </div>

      {/* Body */}
      <div className='flex mt-4 sm:mt-8'>
        <div className='w-full bg-gray-800 p-5 rounded-lg'>
          <h2 className='text-white'>Câu hỏi số {currentQuestion + 1}</h2>
          <p className='font-bold text-justify text-white'>{questionList[currentQuestion].question}</p>
          <div className='flex flex-col gap-y-3 mt-5'>
            {currentAnswers.map((option, index) => (
              <div
                key={index}
                className={`flex items-center justify-between py-3 px-5 border border-solid border-[#00F801] ${
                  selectedAnswers[questionList[currentQuestion].question_id] === option.answer_id
                    ? "border-l-4 bg-white shadow-lg text-black"
                    : " text-white"
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

          {/* Navigation Buttons */}
          <div className='flex justify-between mt-5'>
            <Button onClick={handlePrev} disabled={currentQuestion === 0} className='bg-[#111211] text-white'>
              Prev
            </Button>
            <Button onClick={handleNext} disabled={currentQuestion === questionList.length - 1} className='bg-[#111211] text-white'>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Question List */}
      {/* <div className='flex overflow-x-auto p-3 gap-4 items-center justify-center mt-8 bg-gray-800 rounded-lg'>
        {questionList.map((_, index) => (
          <div
            key={index}
            className={`w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer ${
              selectedAnswers[questionList[index].question_id] ? "bg-[#00F801]" : "bg-white"
            } ${currentQuestion === index ? "border-4 border-[#00F801]" : "hover:bg-[#00F801]"}`}
            onClick={() => setCurrentQuestion(index)}
          >
            <span className={`${selectedAnswers[questionList[index].question_id] ? "text-white" : "text-black"}`}>{index + 1}</span>
          </div>
        ))}
      </div> */}
      <div className='flex overflow-x-auto gap-4 items-center justify-start mt-4 sm:mt-8 bg-gray-800 rounded-lg p-3'>
        {questionList.map((_: unknown, index: number) => (
          <div
            key={index}
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
              selectedAnswers[questionList[index].question_id] ? "bg-[#00F801]" : "bg-white"
            } ${currentQuestion === index ? "border-4 border-[#00F801]" : "hover:bg-[#00F801]"}`}
            onClick={() => setCurrentQuestion(index)}
            style={{ minWidth: "40px", minHeight: "40px" }} // Ensures each item is 40x40px
          >
            <span className={`${selectedAnswers[questionList[index].question_id] ? "text-white" : "text-black"}`}>{index + 1}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        title={
          timeLeft > 0
            ? Object.keys(selectedAnswers).length < questionList.length
              ? "Chưa hoàn thành câu hỏi"
              : "Xác nhận nộp bài"
            : "Hết thời gian"
        }
        visible={isModalVisible}
        centered
        onCancel={timeLeft > 0 ? () => setIsModalVisible(false) : undefined}
        footer={
          timeLeft > 0 ? (
            <div className='flex items-center justify-end gap-x-3 sm: gap-x-4'>
              <button onClick={() => setIsModalVisible(false)} className='bg-red-500 text-white px-4 py-2 rounded-md'>
                Cancel
              </button>
              <button onClick={handleConfirmSubmit} className='bg-green-500 text-white px-4 py-2 rounded-md'>
                OK
              </button>
            </div>
          ) : null
        }
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
