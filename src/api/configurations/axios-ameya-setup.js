import axios from "axios";

const getAnalyticsBaseUrl = () => {
    const analyticsBaseURL = JSON.parse(localStorage.getItem("analytics_base_url")) ?? null
    return analyticsBaseURL;
};

const requestHandler = async (request) => {
    const agent_user_token = JSON.parse(localStorage.getItem('agent-user-token')) ?? null
    const is_appflyte = process.env.IS_APPFLYTE_INSTANCE || "";
    const isAppflyte = is_appflyte?.toLowerCase() === "true";
    const prefix = isAppflyte ? "appflyte_" : "";

    request.headers['Authorization'] = `Bearer ${prefix}${agent_user_token?.tokenId}`;
    request.headers['Content-Type'] = 'application/json';
    request.headers['Accept'] = 'application/json';
    return request
}

const AxiosAnalyticsToolObj = axios.create({ responseType: "json" });
AxiosAnalyticsToolObj.interceptors.request.use(request => {
    request.baseURL = getAnalyticsBaseUrl();
    return requestHandler(request);
});


export default AxiosAnalyticsToolObj;

