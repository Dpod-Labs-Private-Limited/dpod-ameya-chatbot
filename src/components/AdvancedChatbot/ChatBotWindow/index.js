import React, { useState, useRef, useEffect } from 'react';
import { ReactSVG } from "react-svg";

import { useStyles } from './styles';
import { Box, InputAdornment, TextField, Typography, IconButton, Snackbar, Switch, FormControlLabel, Button, Tooltip, Alert } from '@mui/material';
import { Close, StopCircle } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import "./styles.css"

import ChatSidebar from '../ChatSidebar';
import ChatSource from '../ChatSource';
import ChatBookmarks from '../ChatBookmarks';
import ChatThreads from '../ChatThreads';
import ChatMessages from '../ChatMessages';

import AnalyticsChatsApi from '../../../api/services/AnalyticsChatsApi';
import { createThreadsChatFlow, fetchThreadsData, getChatBookmarkInfo, handleCloseSession, handleQuery } from '../../../utils/getChatDetails';
import { handleTokenExpiration } from '../../../containers/Authentication/checkTokenExpiry';
import { IconSvg } from '../../../styles/globalIcons';
import { useAppContext } from '../../../context/AppContext';
import { tostAlert } from '../../../utils/alertToast';

function ChatBotWindow(props) {

    const theme = useTheme();
    const styles = useStyles(theme);
    const { bookmarkData, bookmarkAdded, threadAdded, chatSourceState, setBookmarkData,
        setThreadAdded, setBookmarkAdded, threadsData, setThreadsData } = useAppContext();

    const [selectedMenu, setSelectedMenu] = useState('Home')
    const [progressData, setProgressData] = useState(null);
    const [chatInit, setChatInit] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(null)
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const [isInitChat, setIsInitChat] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [correlationId, setCorrelationId] = useState('');

    // Source Details
    const [sourceLoading, setSourceLoading] = useState(false);
    const [thinkStatus, setThinkStatus] = useState(false)
    const [selectedSource, setSelectedSource] = useState(null);

    // Chat Thread And Bookmark Details
    const [threadsLoading, setThreadsLoading] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const [viewThreads, setViewThreads] = useState(false);
    const [newThread, setNewThread] = useState(false);

    const [allMessages, setAllMessages] = useState([]);
    const [displayMessages, setDisplayMessages] = useState([]);

    const messagesPerPage = 2;
    const chatWindowRef = useRef(null);
    const messagesEndRef = useRef(null);
    const streamAbortRef = useRef(null);
    const isStoppedRef = useRef(false);

    const [scrollHeightBefore, setScrollHeightBefore] = useState(0);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [chatbotError, setChatbotError] = useState(null)
    const [notificationStatus, setNotificationStatus] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            const service_agent_user_token = localStorage.getItem("service-agent-user-token")
            const analytics_base_url = localStorage.getItem("analytics_base_url")
            const agent_user_token = localStorage.getItem("agent-user-token")
            if (!service_agent_user_token || !analytics_base_url || !agent_user_token) {
                clearInterval(interval);
                window.location.reload();
            }
            handleTokenExpiration(props)
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            const session_id = JSON.parse(localStorage.getItem('session_id'));
            if (session_id && selectedSource?.dataset_id) {
                const source_type = selectedSource?.dataset_id?.split("_")[0] ?? null;
                handleCloseSession(session_id, selectedSource?.dataset_id, source_type);
                localStorage.removeItem('session_id');
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [selectedSource]);

    useEffect(() => {
        const handleChatSession = async () => {
            if (selectedMenu === "Home" || newThread === true) {
                setSelectedMenu('Home')
                setViewThreads(false)
                setAllMessages([])
                setDisplayMessages([])
                setIsInitChat(true)
                setInputValue('')
                setSessionId('')
                setNewThread(false)
                const session_id = JSON.parse(localStorage.getItem('session_id'));
                if (session_id) {
                    const source_type = selectedSource?.dataset_id?.split("_")[0] ?? null
                    const response = await handleCloseSession(session_id, selectedSource?.dataset_id, source_type)
                    if (response === true) {
                        localStorage.removeItem('session_id');
                        setThreadAdded(true)
                    }
                }

            }
        }
        handleChatSession()
    }, [newThread, selectedMenu])


    useEffect(() => {
        const { DEFAULT_MESSAGE } = props?.config ?? {};
        const message = DEFAULT_MESSAGE?.message?.trim();

        if (DEFAULT_MESSAGE?.status && message) {
            setInputValue(message);
        }

    }, [props]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [progressData]);

    useEffect(() => {
        if (isAtBottom && chatWindowRef.current) {
            requestAnimationFrame(() => {
                chatWindowRef.current.scrollTo({ top: chatWindowRef.current.scrollHeight, behavior: 'smooth' });
            });
        }
    }, [displayMessages]);

    useEffect(() => {
        fetchBookmarkDetails()
    }, [bookmarkAdded])

    useEffect(() => {
        fetchThreadDetails()
    }, [threadAdded])

    const handleSendMessage = async (chat_message) => {
        try {
            if (!chat_message) return;

            if (!selectedSource || !selectedSource?.dataset_id?.trim()) {
                tostAlert("Please Select Data Set and try again...", 'warning')
                return
            }

            setIsInitChat(false)
            setInputValue('')
            setChatInit(false)
            setCurrentIndex(null)
            if (chat_message) {
                const userMessage = {
                    text: chat_message,
                    owner: "user",
                    thinking_dropdown_status: false,
                    progress_data: null,
                    progress_status: false,
                }
                setAllMessages((prev) => {
                    const index = prev.length;
                    setCurrentIndex(index)
                    return [...prev, userMessage];
                });
                setDisplayMessages([userMessage]);
                setIsAtBottom(true);
                await handleChat(chat_message)
            }

        } catch (error) {
            console.log(error);
        }
    };

    const handleChat = async (chat_message) => {
        setLoading(true);
        try {
            setChatInit(true)
            setNotificationStatus(false)
            const app_id = props?.config?.APP_DETAILS?.app_id ?? null;
            const response = await handleQuery(chat_message, sessionId, selectedSource, thinkStatus, app_id);
            if (response.status === 200) {
                const responseData = response?.data ?? {}
                localStorage.setItem("session_id", JSON.stringify(responseData?.session_id))
                setSessionId(responseData?.session_id)
                setCorrelationId(responseData?.correlation_id)
                await handleResponseStream(responseData?.correlation_id, responseData?.session_id, chat_message)
            }
        } catch (error) {
            console.error(error);
            setChatbotError("Something went wrong. Please try again.");
            setChatInit(false);
        } finally {
            setLoading(false);
        }
    };

    const handleResponseStream = async (correlation_id, session_id, user_message) => {
        let chatProgress = "";
        let accumulatedChat = "";
        isStoppedRef.current = false;
        streamAbortRef.current = new AbortController();

        function shouldAppendChunk(existingText, newChunk) {
            if (!newChunk) return false;
            return !existingText.endsWith(newChunk.trim());
        }

        function appendChunk(existingText, newChunk) {
            if (!newChunk) return existingText;
            const trimmedExisting = existingText.trimEnd();
            const trimmedChunk = newChunk.trim();
            if (!shouldAppendChunk(trimmedExisting, trimmedChunk)) return existingText;
            const needsSpace =
                trimmedExisting &&
                !trimmedExisting.endsWith(' ') &&
                !['.', '!', '?', ','].includes(trimmedExisting.slice(-1));
            const separator = needsSpace ? ' ' : '';
            return trimmedExisting + separator + trimmedChunk;
        }

        try {
            setProgressData(null);
            const reader = await AnalyticsChatsApi.queryResponseStream(correlation_id, session_id, user_message, streamAbortRef.current.signal);
            const decoder = new TextDecoder();

            while (true) {

                if (isStoppedRef.current || streamAbortRef.current.signal.aborted) {
                    break;
                }

                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const events = chunk.split("\n").filter(line => line.trim() !== "");

                for (const event of events) {
                    try {

                        if (isStoppedRef.current) break;

                        if (!event.startsWith("data: ")) continue;
                        const jsonData = event.replace("data: ", "").trim();
                        const data = JSON.parse(jsonData);

                        if (data.response.type === "progress") {
                            setChatInit(false);
                            chatProgress += data.response.data.msg;

                            setAllMessages((prev) => {
                                const updatedHistory = [...prev];
                                if (updatedHistory[updatedHistory.length - 1]?.owner === 'user') {
                                    updatedHistory[updatedHistory.length - 1].progress_status = true;
                                    updatedHistory[updatedHistory.length - 1].progress_data = data.response.data.msg;
                                }
                                return updatedHistory;
                            });

                            setDisplayMessages((prev) => {
                                const updatedHistory = [...prev];
                                if (updatedHistory[updatedHistory.length - 1]?.owner === 'user') {
                                    updatedHistory[updatedHistory.length - 1].progress_status = true;
                                    updatedHistory[updatedHistory.length - 1].progress_data = data.response.data.msg;
                                }
                                return updatedHistory;
                            });
                            setProgressData(chatProgress);
                        }
                        if (data.response.type === "chat" || data.response.type === "image") {

                            const resetUserProgress = (prev) => {
                                return prev.map((item, index) => {
                                    if (
                                        index === prev.length - 1 &&
                                        item.owner === "user" &&
                                        item.progress_status
                                    ) {
                                        return { ...item, progress_status: false, progress_data: null };
                                    }
                                    return item;
                                });
                            };

                            setAllMessages((prev) => resetUserProgress(prev));
                            setDisplayMessages((prev) => resetUserProgress(prev));
                            setChatInit(false);

                            const safeText = (msg) =>
                                typeof msg === "string"
                                    ? msg.trim()
                                    : msg == null
                                        ? ""
                                        : String(msg);

                            const updateBotItem = (prev) => {
                                const updatedHistory = [...prev];
                                let lastItem = updatedHistory.at(-1);
                                const messageId = data?.message_id ?? null;

                                if (!lastItem || lastItem.owner !== "bot") {
                                    lastItem = {
                                        session_id,
                                        message_id: messageId,
                                        owner: "bot",
                                        text: "",
                                        messages: [],
                                        chat_progress: chatProgress,
                                        is_bookmarked: false,
                                        is_chart: false,
                                        progress_status: false,
                                    };
                                    updatedHistory.push(lastItem);
                                    accumulatedChat = "";
                                }

                                if (data.response.type === "chat") {
                                    const chunk = safeText(data.response.data.msg);
                                    accumulatedChat = appendChunk(accumulatedChat, chunk);

                                    const lastMsg = lastItem.messages.at(-1);

                                    if (lastMsg?.type === "chat") {
                                        lastMsg.text = accumulatedChat;
                                    } else {
                                        lastItem.messages.push({ type: "chat", text: accumulatedChat });
                                    }

                                    lastItem.text = accumulatedChat;
                                    lastItem.chat_progress = chatProgress;
                                    lastItem.message_id = messageId;
                                }

                                if (data.response.type === "image") {
                                    if (accumulatedChat) {
                                        const lastMsg = lastItem.messages.at(-1);
                                        if (lastMsg?.type !== "chat") {
                                            lastItem.messages.push({ type: "chat", text: accumulatedChat });
                                        }
                                        lastItem.text = accumulatedChat;
                                        accumulatedChat = "";
                                    }
                                    lastItem.messages.push({ type: "image", url: data.response.data.msg ?? "" });
                                    lastItem.message_id = messageId;
                                }

                                return updatedHistory;
                            };

                            setAllMessages((prev) => updateBotItem(prev));
                            setDisplayMessages((prev) => updateBotItem(prev));
                        } else if (data.response.type === 'chart') {
                            setChatInit(false);
                            const chart_data = data?.response?.data ?? {};

                            setAllMessages((prev) => {
                                const updatedHistory = [...prev];
                                if (updatedHistory[updatedHistory.length - 1]?.owner === 'bot') {
                                    const lastMsg = updatedHistory[updatedHistory.length - 1];
                                    if (Array.isArray(lastMsg.chart)) {
                                        lastMsg.chart.push(chart_data);
                                    } else if (lastMsg.chart) {
                                        lastMsg.chart = [lastMsg.chart, chart_data];
                                    } else {
                                        lastMsg.chart = [chart_data];
                                    }

                                    lastMsg.is_chart = true;
                                }
                                return updatedHistory;
                            });

                            setDisplayMessages((prev) => {
                                const updatedHistory = [...prev];
                                if (updatedHistory[updatedHistory.length - 1]?.owner === 'bot') {
                                    const lastMsg = updatedHistory[updatedHistory.length - 1];

                                    if (Array.isArray(lastMsg.chart)) {
                                        lastMsg.chart.push(chart_data);
                                    } else if (lastMsg.chart) {
                                        lastMsg.chart = [lastMsg.chart, chart_data];
                                    } else {
                                        lastMsg.chart = [chart_data];
                                    }

                                    lastMsg.is_chart = true;
                                }
                                return updatedHistory;
                            });
                        }
                        else if (data.response.type === "notify" && !isStoppedRef.current) {
                            if (!("Notification" in window)) {
                                console.warn("This browser does not support notifications.");
                                return;
                            }

                            let notificationPermissionAsked = false;

                            if (!notificationPermissionAsked) {
                                notificationPermissionAsked = true;
                                try {
                                    const permission = await Notification.requestPermission();
                                    if (permission === "granted") {
                                        console.log("Notification permission granted by user.");
                                        setNotificationStatus(true);
                                    } else {
                                        console.log("Notification permission denied by user.");
                                        setNotificationStatus(false);
                                    }
                                } catch (error) {
                                    console.error("Error requesting notification permission:", error);
                                    setNotificationStatus(false);
                                }
                            }

                            if (
                                Notification.permission === "granted" &&
                                notificationStatus === false
                            ) {
                                setNotificationStatus(true);
                            }
                        }
                        if (data.response.data.done && !isStoppedRef.current) {
                            if (Notification.permission === "granted") {
                                try {
                                    const notification = new Notification("💬 Chatbot Response Ready", {
                                        body: "Your chatbot reply is complete.",
                                        tag: "chatbot-response",
                                        timestamp: Date.now(),
                                    });

                                    notification.onclick = () => {
                                        window.focus();
                                        notification.close();
                                    };
                                } catch (error) {
                                    console.error("Error displaying notification:", error);
                                }
                            }
                            break;
                        }
                    } catch (parseError) {
                        console.error("JSON Parse Error:", parseError, "Raw event:", event);
                        setChatInit(false);
                    }
                }
            }
        } catch (error) {
            if (error.name === "AbortError" || isStoppedRef.current) {
                console.log("Stream aborted by user");
                return;
            }
            console.error("Stream Error:", error);
            setChatbotError("Something went wrong. Please try again.");
        } finally {
            if (!isStoppedRef.current) {
                setChatInit(false);
            }
            setCurrentIndex(null);
            setLoading(false);
        }
    };

    const handleStopMessage = async (item) => {
        try {

            if (isStoppedRef.current) return;
            isStoppedRef.current = true;

            if (streamAbortRef.current) {
                streamAbortRef.current.abort();
            }

            await AnalyticsChatsApi.queryChatStop(item);

            setAllMessages(prev =>
                prev.map((msg, idx) =>
                    idx === prev.length - 1 && msg.owner === "user"
                        ? { ...msg, progress_status: false, progress_data: null }
                        : msg
                )
            );

            setDisplayMessages(prev =>
                prev.map((msg, idx) =>
                    idx === prev.length - 1 && msg.owner === "user"
                        ? { ...msg, progress_status: false, progress_data: null }
                        : msg
                )
            );

            setProgressData(null);
            setLoading(false);
            setChatInit(false);
            setCurrentIndex(null);
            setNotificationStatus(false);

        } catch (error) {
            console.error("Stop error:", error);
        }
    }

    const handleScroll = () => {
        if (!chatWindowRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;

        if (scrollTop === 0) {
            setScrollHeightBefore(scrollHeight);
            loadOlderMessages();
        }
        setIsAtBottom(scrollHeight - scrollTop === clientHeight);
    };

    const loadOlderMessages = () => {
        if (displayMessages.length === allMessages.length) return;
        const container = chatWindowRef.current;

        const newPage = Math.min(displayMessages.length + messagesPerPage, allMessages.length);
        setDisplayMessages(allMessages.slice(-newPage));

        requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTo({ top: newScrollHeight - scrollHeightBefore, behavior: 'smooth' });
        });
    };

    const handleClose = () => {
        setChatbotError(null);
    };

    const handleThinkStatus = async (messageIndex, status) => {
        setAllMessages(prevMessages => {
            return prevMessages.map((message, index) => index === messageIndex ? { ...message, thinking_dropdown_status: status } : message)
        })
        setDisplayMessages(prevMessages => {
            return prevMessages.map((message, index) => index === messageIndex ? { ...message, thinking_dropdown_status: status } : message)
        })
    }

    const handleThreadSelection = async (thread_id) => {
        try {
            setViewThreads(false)
            setProgressData(null)
            const filteredThread = threadsData?.length > 0 ? threadsData.find((item) => item?.session_id === thread_id) : {};
            const session_id = filteredThread?.session_id ?? null;
            const threadDatasetId = filteredThread?.dataset_id ?? null;
            setSessionId(session_id);
            localStorage.setItem("session_id", JSON.stringify(session_id))

            const selectedDataset = chatSourceState?.find((item) => item.dataset_id === threadDatasetId) ?? {};
            setSelectedSource(selectedDataset);

            const chat_history = filteredThread?.chat_history ?? []
            const threadsMessages = await createThreadsChatFlow(chat_history, session_id, bookmarkData);
            setIsInitChat(false)
            setAllMessages(threadsMessages);
            setDisplayMessages(threadsMessages);
        } catch (error) {
            console.log(error)
        }
    }

    const fetchBookmarkDetails = async () => {
        if (bookmarkLoading) return
        setBookmarkLoading(true);
        try {
            if (bookmarkData?.length === 0 || bookmarkAdded === true) {
                const response = await getChatBookmarkInfo();
                setBookmarkData(response);
                setBookmarkAdded(false);
            }
        } catch (error) {
            console.error(error);
            setChatbotError("Something went wrong. Please try again.");
        } finally {
            setBookmarkLoading(false);
        }
    }

    const fetchThreadDetails = async () => {
        if (threadsLoading) return;
        setThreadsLoading(true)
        try {
            if (threadsData?.length === 0 || threadAdded === true) {
                const response = await fetchThreadsData();
                setThreadsData(response)
                setThreadAdded(false)
                return response
            }
        } catch (error) {
            console.log(error)
            return []
        } finally {
            setThreadsLoading(false)
        }
    }

    return (<Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'transparent' }}>

        {/* {!isOpen && (
            <Button
                onClick={() => setIsOpen(true)}
                sx={styles.launchButton}
            >
                <ReactSVG
                    src={{
                        chatlaunch1: IconSvg.chatlaunch1Icon,
                        chatlaunch2: IconSvg.chatlaunch2Icon,
                        chatlaunch3: IconSvg.chatlaunch3Icon,
                        chatlaunch4: IconSvg.chatlaunch4Icon
                    }[props?.config?.APP_DETAILS?.app_launch_icon] || IconSvg.chatlaunch1Icon}
                    beforeInjection={(svg) => {
                        svg.setAttribute("style", "width:24px; height:24px; display:block;");
                    }}
                />
            </Button>
        )} */}

        {isOpen && (<Box sx={styles.chatBotMainWindow}>

            <Box sx={styles.chatBotSidebarContainer}>
                <ChatSidebar
                    config={props?.config ?? {}}
                    handleThreadSelection={handleThreadSelection}
                    setSelectedMenu={setSelectedMenu}
                    selectedMenu={selectedMenu}
                    setNewThread={setNewThread}
                    setViewThreads={setViewThreads}
                />
            </Box>

            <Box sx={styles.chatBotMainContainer}>

                {/* <Box sx={{ position: "relative" }}>
                    <Tooltip title="Close" arrow placement="top">
                        <IconButton
                            onClick={() => setIsOpen(false)}
                            sx={styles.closeBtn}
                            size="small"
                        >
                            <ReactSVG
                                src={IconSvg.chatbot_colapsIcon}
                                beforeInjection={(svg) => {
                                    svg.setAttribute("style", "width:24px; height:24px; display:block;");
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                </Box> */}

                <Box sx={styles.chatBotSubContainer}>

                    <Box sx={{ height: '100%', width: '100%' }} >
                        {(selectedMenu === "Home" || (selectedMenu === "Threads" && viewThreads === false)) && (
                            isInitChat ?
                                (<Box height='100%' width="100%" display="flex" justifyContent="center" alignItems="center" >
                                    <Box width={'600px'} textAlign={'center'}>
                                        <Typography variant="h1">
                                            {props?.config?.WELCOME_MESSAGE || 'What do you want to know?'}
                                        </Typography>

                                        <Box
                                            marginTop={'20px'}
                                            bgcolor={theme.palette.primary.light}
                                            borderRadius={'5px'}
                                            border={`1px solid ${theme?.palette?.action.focus}`}
                                        >

                                            <Box padding={'10px'}>
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        placeholder='Type your message ...'
                                                        size='small'
                                                        value={inputValue}
                                                        multiline
                                                        minRows={1}
                                                        maxRows={2}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: '5px',
                                                                backgroundColor: theme.palette.primary.main,
                                                                color: 'black',
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    border: `1px solid ${theme?.palette?.action.focus}`,
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    border: `1px solid ${theme?.palette?.action.focus}`,
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    border: `1px solid ${theme?.palette?.action.focus}`,
                                                                },
                                                                '&.Mui-active .MuiOutlinedInput-notchedOutline': {
                                                                    border: `1px solid ${theme?.palette?.action.focus}`,
                                                                },
                                                            },
                                                            '& textarea': {
                                                                overflowY: 'auto',
                                                                maxHeight: '4.5em'
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setInputValue(e.target.value)
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
                                                                handleSendMessage(inputValue);
                                                            } else if (e.key === 'Enter' && e.shiftKey) {
                                                                return;
                                                            }
                                                        }}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end" sx={{ backgroundColor: theme.palette.primary.main }}>
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => inputValue.trim() && handleSendMessage(inputValue)}
                                                                        sx={{
                                                                            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                                                                        }}
                                                                    >
                                                                        <ReactSVG height={'24px'} width={'24px'} src={IconSvg.sendMsgIcon} />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                            style: { fontSize: "14px", fontWeight: '400' }
                                                        }}
                                                    />
                                                </Box>
                                                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                                                    <Box>
                                                        <FormControlLabel
                                                            control={<Switch
                                                                checked={thinkStatus}
                                                                onChange={(e) => setThinkStatus(e.target.checked)}
                                                                sx={{
                                                                    '& .MuiSwitch-switchBase': {
                                                                        '&.Mui-checked': {
                                                                            '& + .MuiSwitch-track': {
                                                                                backgroundColor: '#1976d2',
                                                                                opacity: 1,
                                                                                border: 0
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            }
                                                            label={<Typography variant='h6'>Think</Typography>}
                                                        />
                                                    </Box>
                                                    <ChatSource
                                                        sourceLoading={sourceLoading}
                                                        setChatbotError={setChatbotError}
                                                        selectedSource={selectedSource}
                                                        setSourceLoading={setSourceLoading}
                                                        setSelectedSource={setSelectedSource}
                                                        config={props?.config ?? {}}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>) :
                                (<Box sx={{ height: '100%', width: '100%', display: 'flex', flexGrow: 1 }} >
                                    <Box sx={{
                                        width: '100%',
                                        display: "flex",
                                        justifyContent: "center",
                                        height: '100%',
                                        position: "relative",
                                        flexgrow: '1',
                                        marginBottom: '10px'
                                    }}
                                        ref={chatWindowRef} onScroll={handleScroll}
                                    >
                                        <Box
                                            display={'flex'}
                                            position={'absolute'}
                                            flexDirection={'column'}
                                            width={'calc(100% - 20px)'}
                                            height={'100%'}
                                            padding={'10px'}
                                            sx={{ transition: 'width 0.3s ease-in-out' }}
                                        >

                                            <Box sx={{ ...styles.chatBotMessageContainer }} ref={chatWindowRef} onScroll={handleScroll}>

                                                <Box sx={{ ...styles.chatBotWindowBody, marginBottom: allMessages?.length > 2 ? '20px' : '0px' }}  >
                                                    {displayMessages.map((item, index) => (
                                                        <Box key={index}>
                                                            <ChatMessages
                                                                key={index}
                                                                messageIndex={index}
                                                                message={item}
                                                                setAllMessages={setAllMessages}
                                                                setDisplayMessages={setDisplayMessages}
                                                                config={props?.config ?? {}}
                                                                handleThinkStatus={handleThinkStatus}
                                                                progressData={progressData}
                                                                currentIndex={currentIndex}
                                                                chatInit={chatInit}
                                                            />
                                                        </Box>
                                                    ))}
                                                    <div ref={messagesEndRef} />
                                                </Box>
                                            </Box>

                                            <Box sx={{
                                                width: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                overflowY: "hidden",
                                                overflowX: 'hidden',
                                                height: '14%',
                                                flexgrow: '1'
                                            }}>
                                                <Box sx={{ width: '90%', margin: "auto" }}>
                                                    <TextField
                                                        fullWidth
                                                        placeholder='Ask anything ...'
                                                        size='small'
                                                        value={inputValue}
                                                        disabled={loading}
                                                        multiline
                                                        minRows={1}
                                                        maxRows={2}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end"
                                                                    sx={{ backgroundColor: theme.palette.primary.main }}
                                                                >
                                                                    {(!loading) ?
                                                                        (<IconButton
                                                                            color="primary"
                                                                            onClick={() => inputValue.trim() && handleSendMessage(inputValue)}
                                                                            sx={{
                                                                                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                                                                            }}
                                                                        >
                                                                            <ReactSVG height={'24px'} width={'24px'} src={IconSvg.sendMsgIcon} />
                                                                        </IconButton>)
                                                                        :
                                                                        (<IconButton
                                                                            onClick={() => handleStopMessage(correlationId)}
                                                                            sx={{ cursor: 'pointer' }}
                                                                        >
                                                                            <StopCircle sx={{ height: '24px', width: '24px', color: 'black' }} />
                                                                        </IconButton>)
                                                                    }
                                                                </InputAdornment>
                                                            ),
                                                            style: { fontSize: "14px", fontWeight: '400' }
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: '5px',
                                                                backgroundColor: theme.palette.primary.main,
                                                                color: 'black',
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    border: `1px solid ${theme?.palette?.action.focus}`,
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    border: `1px solid ${theme?.palette?.action.focus}`,
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    border: `1px solid ${theme?.palette?.action.focus}`,
                                                                },
                                                                '&.Mui-active .MuiOutlinedInput-notchedOutline': {
                                                                    border: `1px solid ${theme?.palette?.action.focus}`,
                                                                },
                                                            },
                                                            '& textarea': {
                                                                overflowY: 'auto',
                                                                maxHeight: '4.5em'
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setInputValue(e.target.value);
                                                        }}

                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() && !loading) {
                                                                handleSendMessage(inputValue);
                                                            } else if (e.key === 'Enter' && e.shiftKey) {
                                                                return;
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                    </Box>
                                </Box>
                                ))}

                        {selectedMenu === "Bookmarks" &&
                            (<Box sx={styles.chatBookmarkContainer}>
                                <Box sx={styles.chatBookmarkBody}>
                                    <ChatBookmarks loading={bookmarkLoading} />
                                </Box>
                            </Box>)
                        }
                        {(selectedMenu === "Threads" && viewThreads === true) &&
                            (<Box sx={styles.chatThredContainer}>
                                <Box sx={styles.chatThreadBody}>
                                    <ChatThreads
                                        loading={threadsLoading}
                                        setLoading={setThreadsLoading}
                                        handleThreadSelection={handleThreadSelection}
                                        setChatbotError={setChatbotError}
                                    />
                                </Box>
                            </Box>)}

                    </Box>

                </Box>
            </Box>

            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={Boolean(chatbotError)}
                autoHideDuration={2000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {chatbotError}
                </Alert>
            </Snackbar>

            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={notificationStatus}
                autoHideDuration={4000}
                onClose={() => setNotificationStatus(false)}
                message="This might take a few minutes. You'll get a notification once the chatbot finishes responding."
            />

        </Box >)}
    </Box>
    );
}

export default ChatBotWindow;