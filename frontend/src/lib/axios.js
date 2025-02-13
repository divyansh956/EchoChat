import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:1337/api"
      : "/api",
  withCredentials: true,
});
