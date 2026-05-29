import { jwtDecode } from "jwt-decode";
import agentTokenApi from "../../api/services/agentTokenApi";

const isTokenAboutToExpire = (jwtToken) => {
    const token = jwtDecode(jwtToken);
    const tokenExpireTime = token.exp
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifferenceInSeconds = Math.abs(tokenExpireTime - currentTime);
    return timeDifferenceInSeconds <= 600 ? true : false
}

const createNewToken = async (props) => {
    try {

        const config = props?.config ?? {}
        const appflyte_backend_base_url = config?.API_URL_CONFIGS?.appflyte_backend_base_url ?? "https://api-dev.appflyte.net";
        const service_agent_user_token = config?.AUTHENTICATION_CONFIGS?.service_agent_user_token ?? null;
        const auth_type = config?.AUTHENTICATION_CONFIGS?.auth_type ?? "no_auth";
        const third_party_token = config?.third_party_token ?? null
        const third_party_token_provider = config?.third_party_token_provider ?? null

        const reqObj = {
            service_agent_user_token: service_agent_user_token,
            third_party_token: auth_type === "auth" ? third_party_token : null,
            token_provider: auth_type === "auth" ? third_party_token_provider : null,
        };

        const decoded_token = jwtDecode(service_agent_user_token);
        const schema_id = decoded_token?.schema_id ? decoded_token?.schema_id : null
        const subscriber_id = decoded_token?.subscriber_id ? decoded_token?.subscriber_id : null
        const subscription_id = decoded_token?.subscription_id ? decoded_token?.subscription_id : null

        const response = await agentTokenApi.getAgentUserToken(appflyte_backend_base_url, JSON.stringify(reqObj), subscriber_id, subscription_id, schema_id);
        if (response?.status === 200) {
            const responseData = response?.data ?? {}
            const newToken = {
                tokenId: responseData.__auto_id__,
                token: responseData.agent_user_token
            };
            localStorage.setItem("agent-user-token", JSON.stringify(newToken));
            return response.data
        }
    } catch (error) {
        console.error("Error creating new token:", error);
        window.location.reload();
    }
};

export const handleTokenExpiration = async (props) => {
    try {
        const agent_user_token = JSON.parse(localStorage.getItem('agent-user-token'))
        if (agent_user_token?.token) {
            const is_expiring = isTokenAboutToExpire(agent_user_token?.token)
            if (is_expiring) {
                console.log("Token Expiring Creating new...!")
                createNewToken(props);
            }
        }
    }
    catch (err) {
        console.log("Invalid Token", err);
        window.location.reload();
    }
}