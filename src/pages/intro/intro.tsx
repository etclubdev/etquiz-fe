import { useEffect, useState } from "react";
import useLocalStorage, { LocalStorageEventTarget } from "../../hooks/useLocalStorageDecode";
import { useNavigate } from "react-router-dom";
import { Button, Drawer, Input, Modal } from "antd";
import Info from "../info/info";
import { MenuOutlined } from "@ant-design/icons"; // Icon for the hamburger menu

interface IStar {
  id: number;
  top: number; // Random top position (in %)
  left: number; // Random left position (in %)
  delay: number; // Random animation delay
  size: number;
}
function Intro() {
  const [stars, setStars] = useState<IStar[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false); // Track whether to show Info modal
  const { storedData: initialStudentInfo, getStoredValue, reset } = useLocalStorage("studentInfo");
  const [studentInfo, setStudentInfo] = useState(initialStudentInfo);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false); // State for mobile drawer
  const [showFindResult, setShowFindResult] = useState(false);
  const [mssv, setMssv] = useState(""); // State để lưu giá trị MSSV
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMssv(e.target.value);
  };
  const navigate = useNavigate();
  const handleCancel = () => {
    setIsModalVisible(false);
    setShowInfoModal(false);
    setIsDrawerVisible(false);
    setShowFindResult(false);
  };
  const handleRetake = () => {
    reset();
    setShowInfoModal(true); // Show Info modal after reset
  };
  const showModal = () => {
    if (studentInfo) {
      if (studentInfo.result !== undefined) {
        // Show options modal if result exists
        setIsModalVisible(true);
      } else {
        // Navigate to /exam if studentInfo exists but result is undefined
        navigate("/exam");
      }
    } else {
      // Show Info modal if no studentInfo
      setShowInfoModal(true);
    }
  };
  const toggleDrawer = () => setIsDrawerVisible(!isDrawerVisible);

  useEffect(() => {
    // Generate a set number of stars with random positions and delays
    const generateStars = () => {
      const starArray = [];
      for (let i = 0; i < 100; i++) {
        const size = Math.random() * 2 + 1; // Random size for each star
        starArray.push({
          id: i,
          top: Math.random() * 100, // Random top position (in %)
          left: Math.random() * 100, // Random left position (in %)
          delay: Math.random() * 3, // Random animation delay
          size: size,
        });
      }
      setStars(starArray);
    };

    generateStars();
  }, []);
  useEffect(() => {
    // Listener để cập nhật studentInfo mỗi khi setValue được gọi
    const handleStorageChange = () => {
      setStudentInfo(getStoredValue());
    };
    LocalStorageEventTarget.addEventListener("reset", handleStorageChange);

    return () => {
      LocalStorageEventTarget.removeEventListener("reset", handleStorageChange);
    };
  }, [getStoredValue, reset, studentInfo]);

  return (
    <div className='min-h-screen bg-[#080808] text-[#C1C1C1] font-sans relative overflow-hidden'>
      {/* Navbar */}
      <header className='w-full flex justify-between items-center px-4 py-4 bg-[#111211] shadow-lg sticky z-[1]'>
        <div
          onClick={() => window.open("https://www.facebook.com/ETClub.UEH", "_blank")}
          className='text-[#00F801] text-xl sm:text-3xl font-bold animate-pulse'
        >
          Economic Technology
        </div>
        <div className='sm:hidden' onClick={toggleDrawer}>
          <MenuOutlined className='text-2xl text-[#C1C1C1] cursor-pointer' />
        </div>
        {/* Desktop Menu */}
        <nav className='hidden sm:flex'>
          <ul className='flex space-x-6 md:space-x-10 text-lg font-bold'>
            <li
              onClick={() => window.open("https://www.facebook.com/ETClub.UEH", "_blank")}
              className='hover:text-[#00F801] cursor-pointer transition-colors duration-300'
            >
              Thông tin cuộc thi
            </li>
            <li
              onClick={() => window.open("https://www.facebook.com/ETClub.UEH", "_blank")}
              className='hover:text-[#00F801] cursor-pointer transition-colors duration-300'
            >
              Liên hệ
            </li>
            <li
              onClick={() => setShowFindResult(!showFindResult)}
              className='hover:text-[#00F801] cursor-pointer transition-colors duration-300'
            >
              Tra cứu kết quả
            </li>
          </ul>
        </nav>
      </header>

      {/* Mobile Menu */}
      <Drawer title={null} placement='right' onClose={toggleDrawer} open={isDrawerVisible} width='70%' className='sm:hidden'>
        <ul className='space-y-4 text-lg font-bold text-center'>
          <li onClick={() => window.open("https://www.facebook.com/ETClub.UEH", "_blank")} className='hover:text-[#00F801] cursor-pointer'>
            Thông tin cuộc thi
          </li>
          <li onClick={() => window.open("https://www.facebook.com/ETClub.UEH", "_blank")} className='hover:text-[#00F801] cursor-pointer'>
            Liên hệ
          </li>
          <li className='hover:text-[#00F801] cursor-pointer'>Tra cứu kết quả</li>
        </ul>
      </Drawer>

      {/* Twinkling Stars */}
      <div className='stars absolute top-0 left-0 w-full h-full overflow-hidden z-0'>
        {stars.map((star) => (
          <div
            key={star.id}
            className='star bg-[#C1C1C1] rounded-full absolute'
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              animation: `twinkle 3s ${star.delay}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className='flex flex-col md:flex-row items-center justify-center min-h-[80vh] gap-4 md:gap-10 px-4 sm:px-8 md:px-12 relative z-10'>
        {/* Left Column: Banner (Hidden on Mobile) */}
        <div className='hidden md:flex w-full md:w-1/2 h-[300px] sm:h-[400px] rounded-lg shadow-lg items-center justify-center transform hover:scale-105 transition-transform duration-500 animate-float'>
          <img
            src='https://static.vecteezy.com/system/resources/thumbnails/050/703/352/small/cyber-security-label-maximum-protection-against-cyber-threats-and-identity-theft-data-protection-png.png'
            alt=''
            className='w-full h-full object-cover rounded-lg'
          />
        </div>

        {/* Right Column: Introduction Text */}
        <div className='w-full md:w-1/2 space-y-6 md:space-y-8 text-center md:text-left px-4 sm:px-0'>
          <h2 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#00F801]'>
            HOW TO <span className='bg-white text-black px-[5px] py-[2px]'>PROTECT</span> YOUR INFORMATION
          </h2>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl animate-fade-in-down text-justify'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia reprehenderit, ipsam minima maiores ratione eos alias? Eius
            obcaecati ea neque voluptatibus, itaque iste explicabo ullam, fugit possimus, atque dolores a.
          </p>

          {/* Start Contest Button */}
          <button
            className='mt-4 sm:mt-6 px-6 sm:px-10 py-2 sm:py-4 bg-[#00F801] text-[#111211] text-base sm:text-lg font-semibold rounded-full shadow-md transition-transform transform hover:scale-110 hover:bg-[#3C3D3C] hover:text-[#00F801] focus:ring focus:ring-[#00F801] animate-bounce'
            onClick={showModal}
          >
            Start Contest
          </button>
        </div>
      </div>

      {/* Modal for Results or Retake */}
      <Modal title='Bạn đã hoàn thành bài thi' visible={isModalVisible} onCancel={handleCancel} centered footer={null} destroyOnClose>
        <div className='flex justify-center gap-4'>
          <Button onClick={() => navigate("/result")}>Tra cứu điểm thi</Button>
          <Button onClick={handleRetake} type='primary'>
            Thi lại
          </Button>
        </div>
      </Modal>

      {/* Modal for find result */}
      <Modal title='Tra cứu điểm thi' visible={showFindResult} onCancel={handleCancel} centered footer={null} destroyOnClose>
        <div className='flex flex-col justify-center gap-4'>
          <div>Mã số sinh viên:</div>
          <Input placeholder='Mã số sinh viên' className='p-2 border rounded' value={mssv} onChange={handleChange} />
          <Button type='primary' disabled={!mssv.trim()} onClick={() => navigate("/result")}>
            Tra cứu
          </Button>
        </div>
      </Modal>

      {/* Info Modal */}
      <Modal title={null} visible={showInfoModal} onCancel={handleCancel} footer={null} destroyOnClose>
        <Info /> {/* Render the Info form as modal content */}
      </Modal>

      <div className='fixed bottom-0 right-0 w-fit p-2 text-center'>
        <h1 className='text-xs sm:text-sm'>Trang web được phát triển bởi ban Kỹ Thuật Công Nghệ - ET CLUB</h1>
      </div>
    </div>
  );
}

export default Intro;
