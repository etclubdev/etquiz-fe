import { useRoutes, Navigate } from "react-router-dom";
import Exam from "../pages/exam/exam";
import Result from "../pages/result/result";
import Intro from "../pages/intro/intro";
import useLocalStorage, { LocalStorageEventTarget } from "./useLocalStorageDecode";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
export default function useRoutesElements() {
  const { storedData: initialStudentInfo, getStoredValue } = useLocalStorage("studentInfo");
  const [studentInfo, setStudentInfo] = useState(initialStudentInfo);

  useEffect(() => {
    // Listener để cập nhật studentInfo mỗi khi setValue được gọi
    const handleStorageChange = () => {
      setStudentInfo(getStoredValue());
    };
    LocalStorageEventTarget.addEventListener("setValue", handleStorageChange);

    return () => {
      LocalStorageEventTarget.removeEventListener("setValue", handleStorageChange);
    };
  }, [getStoredValue, studentInfo]);

  const ProtectedExamRoute = ({ children }: { children: React.ReactNode }) => {
    if (!studentInfo) {
      setTimeout(() => {
        toast.warning("Bạn phải nhập thông tin trước khi vào trang thi");
      }, 5);
      return <Navigate to='/' />;
    }
    if (studentInfo && studentInfo.result !== undefined) {
      setTimeout(() => {
        toast.warning("Bạn đã làm bài thi. Đây là kết quả của bài thi bạn");
      }, 5);
      return <Navigate to='/result' />;
    }
    return children;
  };
  const ProtectedResultRoute = ({ children }: { children: React.ReactNode }) => {
    if (!studentInfo) {
      setTimeout(() => {
        toast.warning("Bạn phải nhập thông tin trước khi vào trang kết quả");
      }, 5);
      return <Navigate to='/' />;
    }
    if (studentInfo.result === undefined) {
      setTimeout(() => {
        toast.warning("Bạn chưa làm bài thi. Vui lòng làm bài thi trước khi xem kết quả");
      }, 5);
      return <Navigate to='/' />;
    }
    return children;
  };

  const routeElements = useRoutes([
    {
      path: "/exam",
      element: (
        <ProtectedExamRoute>
          <Exam />
        </ProtectedExamRoute>
      ),
    },
    {
      path: "/result",
      element: (
        <ProtectedResultRoute>
          <Result />
        </ProtectedResultRoute>
      ),
    },
    { path: "/", element: <Intro /> },
    { path: "*", element: <h1>404 Not Found</h1> },
  ]);

  return (
    <>
      <ToastContainer />
      {routeElements}
    </>
  );
}
