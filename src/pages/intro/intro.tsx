import React, { useEffect, useState } from "react";
import { Modal, Button } from "antd";
import Info from "../info/info";
import useLocalStorage, { LocalStorageEventTarget } from "../../hooks/useLocalStorageDecode";
import { useNavigate } from "react-router-dom";

const Intro = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { storedData: initialStudentInfo, getStoredValue, reset } = useLocalStorage("studentInfo");
  const [studentInfo, setStudentInfo] = useState(initialStudentInfo);
  const navigate = useNavigate();

  useEffect(() => {
    // Listener để cập nhật studentInfo mỗi khi setValue được gọi
    const handleStorageChange = () => {
      setStudentInfo(getStoredValue());
      console.log("handle", studentInfo);
    };
    LocalStorageEventTarget.addEventListener("reset", handleStorageChange);

    return () => {
      LocalStorageEventTarget.removeEventListener("reset", handleStorageChange);
    };
  }, [getStoredValue, reset, studentInfo]);
  const showModal = () => {
    if (studentInfo && studentInfo.result === undefined) {
      navigate("/exam");
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className='text-center'>
      <h1>Chào mừng bạn đến với cuộc thi LAW của ETClub</h1>
      <Button type='primary' onClick={showModal} className='mt-4' disabled={studentInfo && studentInfo.result !== undefined}>
        BẤM VÀO ĐÂY ĐỂ THI
      </Button>
      {studentInfo && studentInfo.result !== undefined && (
        <div>
          Chào bạn <strong>{studentInfo.name}</strong> bạn đã hoàn thành bài thi trên trình duyệt này! Nếu bạn muốn thi lại hãy bấm vào đây!
          <Button onClick={reset} type='primary' className='mt-4 ml-4'>
            BẤM VÀO ĐÂY ĐỂ THI LẠI
          </Button>
          Nếu bạn muốn xem điểm hãy bấm vào đây !
          <Button
            onClick={() => {
              navigate("/result");
            }}
            type='primary'
            className='mt-4 ml-4'
          >
            BẤM VÀO ĐÂY ĐỂ XEM ĐÂY
          </Button>
        </div>
      )}

      <Modal
        title={null}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Remove footer to avoid "OK" and "Cancel" buttons
      >
        <Info /> {/* Render the Info form as modal content */}
      </Modal>
    </div>
  );
};

export default Intro;
