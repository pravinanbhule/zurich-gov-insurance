import axios from "axios";
import TokenService from "./Tokenservice";
//export const apiURL = "http://talentcentral.delphianlogic.com/TnaApi/api/";
const BASE_URL = "http://192.168.0.7/ZurichAPI/";

if (window.App_Config) {
  console.log("loading from config file");
}
export const apiURL = window.App_Config
  ? window.App_Config.API_Base_URL + "api/"
  : BASE_URL + "api/";

export const authHeader = () => {
  return {
    "Content-Type": "application/json",
    /*"content-type": "multipart/form-data",*/
    Authorization: "Bearer " + TokenService.getLocalAccessToken(),
    "Access-Control-Allow-Origin": "*",
  };
};

const Axios = axios.create({
  baseURL: apiURL,
  headers: authHeader(),
});
Axios.interceptors.request.use(
  (config) => {
    //const token = TokenService.getLocalAccessToken();
    config.headers = authHeader();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
Axios.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;
    if (err.response.status === 401) {
      TokenService.removeUser();
      window.location.reload(true);
    } else {
      return Promise.reject(err);
    }
    /*if (originalConfig.url !== "user/login" && err.response) {
        
      // Access Token was expired
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          const rs = await Axios.post("/auth/refreshtoken", {
            refreshToken: TokenService.getLocalRefreshToken(),
          });

          const { accessToken } = rs.data;
          TokenService.updateLocalAccessToken(accessToken);

          return Axios(originalConfig);
        } catch (_error) {

          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);*/
  }
);
export default Axios;
