import { InfoData } from "../types/info";
import http from "../utils/http";

const infoApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateResult(body: { result: number }, headers: any) {
    return http.post("/update-result", body, { headers });
  },
  createInfo(body: InfoData) {
    return http.post("/info", body);
  },
};
export default infoApi;
