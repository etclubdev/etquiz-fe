import { Button } from "antd";
import useLocalStorage from "../../hooks/useLocalStorageDecode";
import { useNavigate } from "react-router-dom";

const Result = () => {
  const { storedData: studentInfo } = useLocalStorage("studentInfo");
  const { storedData: questionsInfo } = useLocalStorage("questions");
  const navigate = useNavigate();

  return (
    <div className='flex flex-col w-full max-w-[1300px] justify-center mx-auto p-5'>
      <div className='text-2xl font-bold'>Congratulations</div>
      <span>{studentInfo.name}</span>
      <div className='flex flex-col'>
        Bạn đã hoàn thành {studentInfo.result}/{questionsInfo.length} câu trả lời đúng
      </div>
      <Button
        onClick={() => {
          navigate("/");
        }}
        type='primary'
        className='mt-4 ml-4'
      >
        QUAY LẠI TRANG CHỦ
      </Button>
    </div>
  );
};

export default Result;
