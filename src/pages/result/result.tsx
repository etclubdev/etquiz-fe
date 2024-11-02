import useLocalStorage from "../../hooks/useLocalStorageDecode";

const Result = () => {
  const { storedData: studentInfo } = useLocalStorage("studentInfo");
  const { storedData: questionsInfo } = useLocalStorage("questions");
  console.log(studentInfo.result);
  return (
    <div className='flex flex-col w-full max-w-[1300px] justify-center mx-auto p-5'>
      <div className='text-2xl font-bold'>Congratulations</div>
      <span>{studentInfo.name}</span>
      <div className='flex flex-col'>
        Bạn đã hoàn thành {studentInfo.result}/{questionsInfo.length} câu trả lời đúng
      </div>
    </div>
  );
};

export default Result;
