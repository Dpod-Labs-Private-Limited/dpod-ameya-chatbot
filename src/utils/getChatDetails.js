import AnalyticsChatsApi from "../api/services/AnalyticsChatsApi";
import { apiErrorHandler } from "./errorHandler";

export const handleQuery = async (chat_message, session_id, selectedSource, thinkStatus, app_id) => {
    try {
        const dataset_name = selectedSource?.dataset_name;
        const dataset_id = selectedSource?.dataset_id;
        const source_name = selectedSource?.dataset_id
        const dataset_type = source_name.split("_")[0]
        const reqObj = {
            "user_query": chat_message,
            "session_id": session_id,
            "dataset_name": dataset_name,
            "dataset_id": dataset_id,
            "dataset_type": dataset_type,
            "realm": {},
            "priority": 10,
            "mode": thinkStatus,
            "app_id": app_id
        };
        const response = await AnalyticsChatsApi.queryChatResponse(reqObj);
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
};

export const handleCloseSession = async (session_id, dataset_id, dataset_type) => {
    try {
        if (!session_id || !dataset_id || !dataset_type) {
            return
        }
        const response = await AnalyticsChatsApi.closeCurrentSession(session_id, dataset_id, dataset_type);
        if (response?.status === 200) {
            return true
        }
        return false
    } catch (error) {
        console.error("Error fetching PDF source files:", error);
        return false
    }
};

export const fetchThreadsData = async () => {
    try {
        const response = await AnalyticsChatsApi.getThreadDetails();
        if (response?.status === 200) {
            const responseData = response?.data?.datas ?? []
            return responseData
        }
        return []
    } catch (error) {
        console.error("Error fetching PDF source files:", error);
        return []
    }
};

function formatAssistantMessages(assistantMessages = []) {
    const formatted = [];
    let chatBuffer = "";

    const safeTrim = (v) => {
        if (v == null) return "";
        if (typeof v === "string") return v.trim();
        if (typeof v === "object") {
            if (typeof v.url === "string" && v.url.trim()) return v.url.trim();
            if (typeof v.src === "string" && v.src.trim()) return v.src.trim();
            return "";
        }
        return String(v).trim();
    };

    for (const item of assistantMessages) {
        if (!item || !item.type) continue;

        const rawMsg = item?.data?.msg;
        const msg = safeTrim(rawMsg);
        if (!msg) continue;

        if (item.type === "chat") {
            chatBuffer += (chatBuffer ? " " : "") + msg;
        } else if (item.type === "image") {
            if (chatBuffer) {
                formatted.push({ type: "chat", text: chatBuffer });
                chatBuffer = "";
            }
            formatted.push({ type: "image", url: msg });
        }
    }
    if (chatBuffer) formatted.push({ type: "chat", text: chatBuffer });

    return formatted;
}


export const createThreadsChatFlow = async (thread_chats, session_id, bookmarkData) => {
    try {
        const threadsCharts = thread_chats?.length > 0 ?
            thread_chats?.map((item) => {

                const message_id = item?.message?.message_id ?? null;
                const user_message = item?.message?.user_message ?? "";
                const assistant_message = item?.message?.assistant_message ?? [];

                const formattedMessages = formatAssistantMessages(assistant_message);
                const chartDatas = assistant_message.filter(history => history?.type === "chart" && history?.data)
                const is_bookmarked = bookmarkData?.some(chat => chat?.message_id === message_id) ?? false;

                return [
                    {
                        owner: 'user',
                        text: user_message
                    },
                    {
                        session_id: session_id,
                        message_id: message_id,
                        owner: 'bot',
                        text: "",
                        messages: formattedMessages,
                        chart: chartDatas.length > 0 ? chartDatas.map(c => c.data) : null,
                        is_chart: chartDatas.length > 0,
                        is_bookmarked: is_bookmarked
                    }
                ];

            }).flat()
            :
            []
        return threadsCharts

    } catch (error) {
        console.log(error)
    }
};

export const handleChatThreads = async (thread_data) => {
    try {
        const session_id = thread_data?.session_id ?? null;
        const created_at = thread_data?.created_at ?? null;
        const chat_history = thread_data?.chat_history ?? [];

        const handleThreadsChats = async (thread_chats) => {
            const message_id = thread_chats?.message?.message_id ?? null;
            const user_message = thread_chats?.message?.user_message ?? "";

            let assistant_message = thread_chats?.message?.assistant_message ?? [];
            if (!Array.isArray(assistant_message)) {
                try {
                    assistant_message = JSON.parse(assistant_message);
                } catch {
                    assistant_message = [];
                }
            }

            const botChat = assistant_message
                .filter(
                    (item) =>
                        item?.type === "chat" &&
                        typeof item?.data?.msg === "string" &&
                        item.data.msg.trim() !== ""
                )
                .map((item) => item.data.msg)
                .join(" ")
                .trim();

            const chartDatas = assistant_message
                .filter((item) => item?.type === "chart")
                .map((item) => item?.data?.chart);

            const chartData = chartDatas.at(-1) ?? null;

            return {
                session_id,
                message_id,
                created_at,
                user_chat: user_message,
                bot_chat: botChat,
                chart: chartData,
            };
        };

        const lastItem = chat_history.at(-1);
        const result = lastItem ? await handleThreadsChats(lastItem) : [];
        return result;
    } catch (error) {
        console.error("Error processing chat threads:", error);
        return [];
    }
};

export const getChatBookmarkInfo = async () => {
    try {
        const response = await AnalyticsChatsApi.getChatBookmarks();
        if (response.status === 200) {
            const responseData = response?.data?.datas ?? []
            const bookmarkDetails = responseData?.[responseData?.length - 1]?.content ?? []
            const messageData = await createBookmarkChatFlow(bookmarkDetails);
            return messageData;
        }
        return []
    } catch (error) {
        console.log(error)
        return []
    }
};

export const createBookmarkChatFlow = async (bookmarkDetails) => {
    const bookmarkCharts = bookmarkDetails?.length > 0 ?
        bookmarkDetails?.map((currentBookmark) => {

            const session_id = currentBookmark?.session_id ?? null;
            const message_id = currentBookmark?.message_info?.message_id ?? null;
            const created_at = currentBookmark?.created_at ?? "";
            const user_message = currentBookmark?.message_info?.user_message ?? "";
            const assistant_message = currentBookmark?.message_info?.assistant_message ?? [];

            const formattedMessages = formatAssistantMessages(assistant_message);
            const chartDatas = assistant_message.filter(history => history?.type === "chart" && history?.data)

            return {
                session_id: session_id,
                message_id: message_id,
                created_at: created_at,
                user_chat: user_message,
                bot_chat: formattedMessages,
                chart: chartDatas.length > 0 ? chartDatas.map(c => c.data) : null,
                is_chart: chartDatas.length > 0,
                is_bookmarked: true
            };
        })
        :
        []

    return bookmarkCharts;
};

export const addChatToBookmark = async (session_id, message_id) => {
    try {
        const reqObj = {
            "session_id": session_id,
            "message_id": message_id
        }
        const repsone = await AnalyticsChatsApi.addChatBookmark(JSON.stringify(reqObj));
        if (repsone?.status === 200) {
            return true
        }
        return false
    } catch (error) {
        console.log(error)
        return false
    }
};

export const removeChatToBookmark = async (session_id, message_id) => {
    try {
        const repsone = await AnalyticsChatsApi.deleteChatBookmark(session_id, message_id);
        if (repsone?.status === 200) {
            return true
        }
        return false
    } catch (error) {
        console.log(error)
        return false
    }
};
