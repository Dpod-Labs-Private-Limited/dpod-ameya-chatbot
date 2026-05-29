import AxiosAnalyticsToolObj from "../configurations/axios-ameya-setup";
import { fetchSubscriberId, fetchSubscriptionId } from "../../utils/getAccountDetails";

class analyticsBackendApi {

    constructor() {
        this.subscriber_id = null;
        this.subscription_id = null;
    }

    async initialize() {
        this.subscriber_id = await fetchSubscriberId();
        this.subscription_id = await fetchSubscriptionId()
    }

    chatSourceDetails = async () => {
        await this.initialize();
        return AxiosAnalyticsToolObj.get(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/query-engine/event/source-details`)
    }

    chatsetDetails = async () => {
        await this.initialize();
        return AxiosAnalyticsToolObj.get(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/user-management/event/get-list-of-data-sets`)
    }

    queryChatResponse = async (reqObj) => {
        await this.initialize();
        return AxiosAnalyticsToolObj.post(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/query-engine/event/query`, reqObj)
    }

    queryResponseStream = async (correlation_id, session_id, user_message, signal) => {
        try {
            await this.initialize();
            const encodedMessage = encodeURIComponent(user_message);
            const analytics_base_url = JSON.parse(localStorage.getItem("analytics_base_url"));
            const url = `${analytics_base_url}/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/query-engine/event/response-stream?correlation_id=${correlation_id}&session_id=${session_id}&user_message=${encodedMessage}`;
            const agent_user_token = JSON.parse(localStorage.getItem('agent-user-token')) ?? null

            const is_appflyte = process.env.IS_APPFLYTE_INSTANCE || "";
            const isAppflyte = is_appflyte?.toLowerCase() === "true";
            const prefix = isAppflyte ? "appflyte_" : "";
            const response = await fetch(url, {
                method: "GET",
                signal,
                headers: {
                    "Authorization": `Bearer ${prefix}${agent_user_token?.tokenId}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.body.getReader();
        } catch (error) {
            console.error("Query Stream Error:", error);
            throw error;
        }
    }

    generateChart = async (session_id, message_id) => {
        await this.initialize();
        return AxiosAnalyticsToolObj.get(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/query-engine/event/generated-chart?session_id=${session_id}&message_id=${message_id}`)
    }

    queryChatStop = async (correlation_id) => {
        await this.initialize();
        return AxiosAnalyticsToolObj.get(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/query-engine/event/stop-chat?correlation_id=${correlation_id}`)
    }

    closeCurrentSession = async (session_id, dataset_id, dataset_type) => {
        await this.initialize();
        return AxiosAnalyticsToolObj.delete(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/session-management/event/close-session?session_id=${session_id}&dataset_id=${dataset_id}&dataset_type=${dataset_type}`)
    }

    getThreadDetails = async () => {
        await this.initialize();
        return AxiosAnalyticsToolObj.get(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/session-management/event/get-thread`)
    }

    deleteThread = async (sessionId) => {
        await this.initialize();
        return AxiosAnalyticsToolObj.delete(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/session-management/event/delete-thread?session_id=${sessionId}`)
    }

    addChatBookmark = async (reqObj) => {
        await this.initialize();
        return AxiosAnalyticsToolObj.post(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/session-management/event/add-bookmark`, reqObj)
    }

    getChatBookmarks = async () => {
        await this.initialize();
        return AxiosAnalyticsToolObj.get(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/session-management/event/get-bookmarks`)
    }

    deleteChatBookmark = async (session_id, message_id) => {
        await this.initialize();
        return AxiosAnalyticsToolObj.delete(`/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/function/session-management/event/delete-bookmark?session_id=${session_id}&message_id=${message_id}`)
    }

}

const AnalyticsChatsApi = new analyticsBackendApi();
export default AnalyticsChatsApi;


