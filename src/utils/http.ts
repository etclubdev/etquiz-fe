import axios, { AxiosError, AxiosInstance } from "axios";
import { toast } from "react-toastify";

class Http {
  instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    this.instance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      function (error: AxiosError) {
        console.log("error", error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any | undefined = error?.response?.data;
        console.log("data", data);
        const message = data?.error || error?.message;
        console.log("message", message);
        if (message) {
          toast.error(message);
        }
        return Promise.reject(error);
      }
    );
  }
}
const http = new Http().instance;
export default http;
