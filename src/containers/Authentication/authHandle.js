import { jwtDecode } from "jwt-decode";
import agentTokenApi from "../../api/services/agentTokenApi";
let api_loading = false;

export async function handleUserAuthentication(config) {
    let errorMessage = null
    try {

        const service_agent_user_token = config?.AUTHENTICATION_CONFIGS?.service_agent_user_token ?? null;
        const service_agent_user_token_id = config?.AUTHENTICATION_CONFIGS?.service_agent_user_token_id ?? null;
        const schema_id = config?.APPFLYTE_ACCOUNT_CONFIGS?.schema_id ?? null;
        const auth_type = config?.AUTHENTICATION_CONFIGS?.auth_type ?? "no_auth";
        const third_party_token = config?.third_party_token ?? null
        const third_party_token_provider = config?.third_party_token_provider ?? null

        const appflyte_backend_base_url = config?.API_URL_CONFIGS?.appflyte_backend_base_url ?? "https://api-dev.appflyte.net";
        const analytics_base_url = config?.API_URL_CONFIGS?.analytics_base_url ?? "https://dev-api.ameya.ai/ameya/analytics/v1";

        localStorage.setItem("service-agent-user-token", JSON.stringify(service_agent_user_token));
        localStorage.setItem("analytics_base_url", JSON.stringify(analytics_base_url));

        if (!service_agent_user_token || !service_agent_user_token_id) {
            errorMessage = "no_service_token";
            console.error("Service agent user token or token ID is missing.");
            return errorMessage;
        }

        if (isTokenExpiring(service_agent_user_token)) {
            errorMessage = "service_token_expired";
            console.error("Service agent user token is expired or expiring soon.");
            return errorMessage;
        }

        if (auth_type === "auth") {
            if (!third_party_token || !third_party_token_provider) {
                errorMessage = "Missing third party token or token provider.";
                console.error("Third party token or token provider is missing for 'auth' type.");
                return errorMessage;
            }
        }

        const storedToken = JSON.parse(localStorage.getItem("agent-user-token"));
        if (!storedToken || isTokenExpiring(storedToken.token)) {
            const newToken = await storeNewToken(appflyte_backend_base_url, schema_id, auth_type, service_agent_user_token, third_party_token, third_party_token_provider);
            if (!newToken) {
                errorMessage = "Failed to create a new token.";
                console.error("Failed to create a new agent user token.");
            } else {
                errorMessage = null;
                console.log("New agent user token created and stored.");
                return errorMessage;
            }
        } else {
            errorMessage = null;
            return errorMessage;
        }
    } catch (error) {
        console.error("Authentication error:", error);
        errorMessage = "An unexpected error occurred during authentication.";
        return errorMessage;
    }
}


const isTokenExpiring = (token) => {
    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp - currentTime <= 600;
    } catch (error) {
        console.error("Invalid token:", error);
        return true;
    }
};

const createNewToken = async (appflyte_backend_base_url, schema_id, auth_type, serviceAgentUserToken, third_party_token, third_party_token_provider) => {
    try {
        if (api_loading) return;
        api_loading = true;
        const reqObj = {
            service_agent_user_token: serviceAgentUserToken,
            third_party_token: auth_type === "auth" ? third_party_token : null,
            token_provider: auth_type === "auth" ? third_party_token_provider : null,
        };
        const decoded_token = jwtDecode(serviceAgentUserToken);
        const subscriber_id = decoded_token?.subscriber_id ? decoded_token?.subscriber_id : null
        const subscription_id = decoded_token?.subscription_id ? decoded_token?.subscription_id : null
        const response = await agentTokenApi.getAgentUserToken(appflyte_backend_base_url, JSON.stringify(reqObj), subscriber_id, subscription_id, schema_id);
        if (response?.status === 200) {
            api_loading = false;
            return response.data;
        }
    } catch (error) {
        console.error("Error creating new token:", error);
    }
    return null;
};

const storeNewToken = async (appflyte_backend_base_url, schema_id, auth_type, serviceAgentUserToken, third_party_token, third_party_token_provider) => {
    const newTokenData = await createNewToken(appflyte_backend_base_url, schema_id, auth_type, serviceAgentUserToken, third_party_token, third_party_token_provider);
    if (newTokenData) {
        const newToken = {
            tokenId: newTokenData.__auto_id__,
            token: newTokenData.agent_user_token
        };
        localStorage.setItem("agent-user-token", JSON.stringify(newToken));
        return newToken;
    }
    return null;
};