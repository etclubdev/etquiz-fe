export interface Question {
  question_id: string;
  question: string;
  correct_answer: string;
}
export interface Answer {
  answer_id: string;
  question_id: string;
  answer: string;
}
