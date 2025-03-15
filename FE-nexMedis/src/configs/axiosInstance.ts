import axios from "axios";

const instance = axios.create({
  // baseURL: "https://lamelia.ludbakazar.my.id",
  baseURL: "http://localhost:3000",
});

// Add a request interceptor to include the token in all requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
