import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import useLocalStorage from "../../hooks/useLocalStorageDecode";
import { useNavigate } from "react-router-dom";

function Congratulations() {
  const [showConfetti, setShowConfetti] = useState(true);
  const { storedData: studentInfo } = useLocalStorage("studentInfo");
  const { storedData: questionsInfo } = useLocalStorage("questions");
  const navigate = useNavigate();

  useEffect(() => {
    // Stop confetti after a few seconds
    const timeout = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className='px-3 sm:px-0 flex flex-col items-center justify-center min-h-screen bg-[#080808] text-white text-center'>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <div className='flex flex-col items-center space-y-4 animate-bounce'>
        <h1 className='text-4xl md:text-6xl font-bold text-[#00F801]'>Congratulations!</h1>
      </div>
      <p className='text-lg md:text-xl text-gray-300'>
        Chúc mừng bạn <strong>{studentInfo.name}</strong> đã hoàn thành bài thi thành công !!!
      </p>
      <p className='text-lg md:text-xl text-gray-300'>
        Số điểm của bạn là: {studentInfo.result}/{questionsInfo.length}
      </p>
      <button
        className='mt-16 px-5 py-2 sm:px-10 sm:py-4 bg-[#00F801] text-[#111211] text-lg font-semibold rounded-full shadow-md transition-transform transform hover:scale-110 hover:bg-[#3C3D3C] hover:text-[#00F801] focus:ring focus:ring-[#00F801]'
        onClick={() => {
          navigate("/");
        }}
      >
        Quay lại trang chủ
      </button>
      <div className='fixed bottom-0 right-0 w-fit'>
        <h1>Trang web được phát triển bởi ban Kỹ Thuật Công Nghệ - ET CLUB</h1>
      </div>
    </div>
  );
}

export default Congratulations;
