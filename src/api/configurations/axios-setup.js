import axios from "axios";

const AxiosObj = axios.create({ responseType: "json" })

const requestHandler = async (request) => {
  request.headers['Content-Type'] = 'application/json';
  return request
}
AxiosObj.interceptors.request.use(request => requestHandler(request));

export default AxiosObj;