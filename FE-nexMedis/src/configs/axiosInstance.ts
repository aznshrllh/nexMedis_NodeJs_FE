import axios from "axios";

const instance = axios.create({
  // baseURL: "https://lamelia.ludbakazar.my.id",
  baseURL: "http://localhost:3000",
});

export default instance;
