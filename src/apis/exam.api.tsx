import http from "../utils/http";

const examApi = {
  getExam() {
    return http.get("/get-exam");
  },
};
export default examApi;
