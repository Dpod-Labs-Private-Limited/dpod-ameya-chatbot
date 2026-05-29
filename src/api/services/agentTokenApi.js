import AxiosObj from "../configurations/axios-setup";

class dpodTokenService {

    getAgentUserToken = async (appflyte_backend, reqObj, subscriber_id, subscription_id, schema_id) => {
        return AxiosObj.post(`${appflyte_backend}/api/ameya/subscriber/${subscriber_id}/subscription/${subscription_id}/schema/${schema_id}/create_user_agent_user_token`, reqObj)
    }

}

const agentTokenApi = new dpodTokenService();
export default agentTokenApi;


