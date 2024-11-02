import React from "react";
import { Input, Button, Form } from "antd";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorageDecode";
import infoApi from "../../apis/info.api";
import { InfoData } from "../../types/info";
import examApi from "../../apis/exam.api";
import { decryptData } from "../../utils/encryptData";
import { Question } from "../../types/question";

const Info = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setValue: saveStudentInfo } = useLocalStorage("studentInfo");
  const { setValue: saveQuestions } = useLocalStorage("questions");
  const { setValue: saveAnswers } = useLocalStorage("answers");
  const handleSubmit = async (values: InfoData) => {
    const [createdStudent, exam] = await Promise.all([infoApi.createInfo(values), examApi.getExam()]);
    saveStudentInfo(createdStudent.data);
    saveQuestions(exam.data.questions.map((q: Question) => ({ ...q, correct_answer: decryptData(q.correct_answer) })));
    saveAnswers(exam.data.answers);
    setTimeout(() => {
      if (createdStudent.data) {
        navigate("/exam");
      }
    }, 0);
  };
  React.useEffect(() => {
    return () => {
      //clear form khi thoát component
      form.resetFields();
    };
  });

  return (
    <div className='max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg'>
      <h1 className='text-2xl font-semibold text-center mb-6'>Nhập Thông Tin Sinh Viên</h1>
      <Form form={form} layout='vertical' onFinish={handleSubmit} className='space-y-4'>
        <Form.Item label='Họ và Tên' name='name' rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
          <Input placeholder='Nhập họ và tên' className='p-2 border rounded' />
        </Form.Item>

        <Form.Item label='MSSV' name='mssv' rules={[{ required: true, message: "Vui lòng nhập MSSV!" }]}>
          <Input placeholder='Nhập MSSV' className='p-2 border rounded' />
        </Form.Item>

        <Form.Item
          label='Email'
          name='email'
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder='Nhập email' className='p-2 border rounded' />
        </Form.Item>

        <Form.Item label='Khóa' name='khoa' rules={[{ required: true, message: "Vui lòng nhập khóa học!" }]}>
          <Input placeholder='Nhập khóa' className='p-2 border rounded' />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' className='w-full py-2'>
            VÀO THI
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Info;