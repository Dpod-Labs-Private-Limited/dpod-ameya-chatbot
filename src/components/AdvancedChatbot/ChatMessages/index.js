import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { ReactSVG } from 'react-svg';
import { jwtDecode } from 'jwt-decode';

import { getStyles } from './styles';
import "../ChatBotWindow/styles.css"
import { Avatar, Typography, Box, Tooltip, CircularProgress } from '@mui/material';
import { Check, ContentCopy, KeyboardArrowDown, KeyboardArrowUp, Link } from '@mui/icons-material';
import { IconSvg } from '../../../styles/globalIcons';
import { addChatToBookmark, removeChatToBookmark } from '../../../utils/getChatDetails';
import { useTheme } from '@mui/material/styles';
import MarkdownRenderer from '../../../utils/MarkdownRenderer';
import { useAppContext } from '../../../context/AppContext';

const ChatMessages = (props) => {
    const theme = useTheme();
    const styles = getStyles(theme)
    const { messageIndex, message, setAllMessages, setDisplayMessages,
        config, handleThinkStatus, progressData, currentIndex, chatInit } = props;
    const { setBookmarkAdded } = useAppContext();

    const [tooltipText, setTooltipText] = useState("Copy to clipboard");
    const [userName, setUserName] = useState(null)

    useEffect(() => {
        try {
            const fetchUserDetails = () => {
                const auth_type = config?.AUTHENTICATION_CONFIGS?.auth_type ?? 'no_auth';

                if (auth_type === "auth") {
                    const user_token = JSON.parse(localStorage.getItem("agent-user-token"));
                    const decoded_token = jwtDecode(user_token?.token);
                    const userName = decoded_token?.name
                    let userInitial = null;

                    if (userName) {
                        const atIndex = userName.indexOf("@");

                        if (atIndex > 0) {
                            const namePart = userName.substring(0, atIndex);
                            const words = namePart.split(".");
                            if (words.length > 0) {
                                if (words.length === 1) {
                                    userInitial = words[0].charAt(0).toUpperCase();
                                } else {
                                    userInitial = (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
                                }
                                setUserName(userInitial);
                            }
                        }
                    }
                }
            }
            fetchUserDetails();
        } catch (error) {
            console.log(error)
        }
    }, [config])

    const handleClick = () => {
        try {
            const feedback_url = config?.APP_DETAILS?.feedback_url ?? "";
            if (!feedback_url.trim()) return;
            window.open(feedback_url, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.log(error);
        }
    };

    const handleCopy = () => {
        const copy_messages = message?.messages ?? [];
        const copy_message = copy_messages?.at(-1)?.text ?? "";
        navigator.clipboard.writeText(copy_message);
        setTooltipText("Copied! ✅");
        setTimeout(() => {
            setTooltipText("Copy to clipboard");
        }, 2000);
    };

    const handleChatBookmark = async (is_bookmarked, session_id, message_id) => {
        try {
            setAllMessages(prevMessages =>
                prevMessages.map(message =>
                    message.message_id === message_id
                        ? { ...message, is_bookmarked: !is_bookmarked }
                        : message
                )
            );

            setDisplayMessages(prevMessages =>
                prevMessages.map(message =>
                    message.message_id === message_id
                        ? { ...message, is_bookmarked: !is_bookmarked }
                        : message
                )
            );

            if (!is_bookmarked) {
                const response = await addChatToBookmark(session_id, message_id);
                if (response === true) {
                    setBookmarkAdded(true)
                }
            } else {
                const response = await removeChatToBookmark(session_id, message_id);
                if (response === true) {
                    setBookmarkAdded(true)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    function decodeBase64Data(base64String, dtype = "f8") {
        try {
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const view = new DataView(bytes.buffer);
            const endianChar = dtype[0];
            let littleEndian = true;
            let type = dtype;

            if (endianChar === "<") {
                littleEndian = true;
                type = dtype.slice(1);
            } else if (endianChar === ">") {
                littleEndian = false;
                type = dtype.slice(1);
            } else if (endianChar === "|") {
                type = dtype.slice(1);
            }

            const dtypeReaders = {
                i1: (i) => view.getInt8(i),
                u1: (i) => view.getUint8(i),
                i2: (i) => view.getInt16(i, littleEndian),
                u2: (i) => view.getUint16(i, littleEndian),
                i4: (i) => view.getInt32(i, littleEndian),
                u4: (i) => view.getUint32(i, littleEndian),
                f4: (i) => view.getFloat32(i, littleEndian),
                f8: (i) => view.getFloat64(i, littleEndian),
            };

            const byteSizes = {
                i1: 1, u1: 1,
                i2: 2, u2: 2,
                i4: 4, u4: 4,
                f4: 4,
                f8: 8,
            };

            const reader = dtypeReaders[type];
            const step = byteSizes[type];

            if (!reader || !step) {
                console.warn(`Unsupported dtype "${dtype}", falling back to uint8`);
                return Array.from(bytes);
            }

            const result = [];
            for (let i = 0; i < bytes.length; i += step) {
                result.push(reader(i));
            }

            return result.filter((v) => typeof v === "number" && !isNaN(v) && isFinite(v));
        } catch (err) {
            console.error("decodeBase64Data failed:", err);
            return [];
        }
    }

    const chartData = useMemo(() => {
        if (!message?.chart) return null;

        const charts = Array.isArray(message.chart) ? message.chart : [message.chart];

        return charts
            .map((chartObj) => {
                if (!chartObj?.chart_json) {
                    console.warn("No chart_json provided for message:", chartObj?.chart_metadata?.execution_id);
                    return null;
                }

                try {
                    const parsedData = JSON.parse(chartObj.chart_json);
                    if (!parsedData?.data || !Array.isArray(parsedData.data)) {
                        console.warn("Invalid chart data structure:", parsedData);
                        return null;
                    }

                    const updatedData = parsedData.data.map((dataItem) => {
                        const newItem = { ...dataItem };

                        // decode Y-axis
                        if (dataItem?.y?.bdata) {
                            const dtype = dataItem.y.dtype || "f8";
                            const yValues = decodeBase64Data(dataItem.y.bdata, dtype);
                            newItem.y = yValues.length ? yValues : [];
                        }

                        // decode X-axis
                        if (dataItem?.x?.bdata) {
                            const dtype = dataItem.x.dtype || "f8";
                            const xValues = decodeBase64Data(dataItem.x.bdata, dtype);
                            newItem.x = xValues.length ? xValues : [];
                        }

                        return newItem;
                    });

                    return {
                        ...parsedData,
                        data: updatedData,
                    };
                } catch (error) {
                    console.error("Error processing chart data:", error);
                    return null;
                }
            })
            .filter(Boolean);
    }, [message?.chart]);

    return (

        <Box>

            {message?.owner === 'user' &&
                (<Box sx={styles.userMessageContainer}>
                    {userName && <Avatar sx={{ bgcolor: '#404040', height: '32px', width: '32px', marginRight: '10px', display: "flex", alignItems: "center" }}>
                        <Typography variant='h5' color={'white'}>{userName}</Typography>
                    </Avatar>}

                    <Box sx={styles.chatBoxMessageContainer}>
                        <Typography variant='h4' sx={{
                            ...styles.chatMessages,
                            color: theme.palette.text.secondary,
                            fontFamily: theme.typography.fontFamily,
                            textAlign: 'left'
                        }}>
                            {message.text}
                        </Typography>
                    </Box>
                </Box>)
            }

            {(chatInit && currentIndex === messageIndex) &&
                (<Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                    <CircularProgress
                        size={'15px'}
                        sx={{
                            color: theme.palette.action.active,
                            backgroundColor: theme.palette.secondary.main,
                            margin: '3px 10px 0px 0px'
                        }}
                    />
                    <Typography variant="body2" sx={{ color: '#000000' }}>Just a second...</Typography>
                </Box>)
            }

            {(message?.progress_status || message.chat_progress) && (
                <Box sx={styles.progressContainer} >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {message?.progress_status && <CircularProgress
                            size={'15px'}
                            sx={{
                                color: theme.palette.action.active,
                                backgroundColor: theme.palette.secondary.main,
                                marginRight: '10px'
                            }}
                        />}
                        <Box
                            sx={styles.dropdowncontainer}
                            onClick={() => handleThinkStatus(messageIndex, !message.thinking_dropdown_status)}
                        >
                            <Typography variant="body2" sx={{ color: '#000000' }}>Show thinking</Typography>
                            <span style={styles.dropdownicon}>
                                {message.thinking_dropdown_status ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </span>
                        </Box>
                    </Box>

                    {message.thinking_dropdown_status && (
                        <div style={styles.dropdowncontent(message?.progress_status)}>
                            {message.chat_progress &&
                                (<Typography sx={{ ...styles.progressText, fontFamily: theme.typography.fontFamily }}>
                                    <MarkdownRenderer displayData={message?.chat_progress} />
                                </Typography>)
                            }
                            {(message?.progress_status) &&
                                (<Typography sx={{ ...styles.progressText, fontFamily: theme.typography.fontFamily }}>
                                    <MarkdownRenderer displayData={progressData} />
                                </Typography>)
                            }
                        </div>
                    )}
                </Box>
            )}

            {message?.owner === 'bot' &&
                (<Box sx={styles.botMessageContainer}>
                    <Box sx={{ ...styles.chatBoxMessageContainer, boxSizing: 'border-box', width: '100%', paddingBottom: '40px' }}>
                        <Box>

                            {(message?.messages)?.length > 0 && (message?.messages)?.map((msg, mindex) =>
                                <Box key={mindex}>
                                    {msg?.type === "chat" &&
                                        (<Box sx={{ textAlign: 'left', fontFamily: theme.typography.fontFamily }}>
                                            <MarkdownRenderer displayData={msg.text} />
                                        </Box>)
                                    }
                                    {msg?.type === "image" &&
                                        (<Box sx={{ textAlign: 'center', width: '100%', marginTop: '2px' }}>
                                            <img
                                                src={msg?.url}
                                                alt="S3 Asset"
                                                style={{
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    borderRadius: '6px',
                                                }}
                                            />
                                        </Box>)
                                    }
                                </Box>)
                            }

                            <Box>
                                {Array.isArray(chartData) && chartData.length > 0 &&
                                    chartData.map((chart, index) => (
                                        <Box key={index} sx={{ width: '100%', overflow: 'hidden' }}>
                                            <Plot
                                                data={chart.data}
                                                layout={chart.layout || {}}
                                                config={{ responsive: true }}
                                                style={{
                                                    width: '100%',
                                                    height: chart.layout?.height || '400px',
                                                    marginTop: '10px'
                                                }}
                                            />
                                        </Box>
                                    ))
                                }
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={styles.bookmarkContainer}>
                        <Tooltip title={tooltipText} arrow disableInteractive sx={{ pointerEvents: 'auto' }}>
                            <Box onClick={handleCopy} sx={{ color: 'black' }}>
                                {tooltipText === "Copied! ✅" ? (
                                    <Check sx={{ height: '16px', width: '16px' }} />
                                ) : (
                                    <ContentCopy sx={{ height: '16px', width: '16px' }} />
                                )}
                            </Box>
                        </Tooltip>
                        <Box
                            onClick={() => handleChatBookmark(message?.is_bookmarked, message?.session_id, message?.message_id)}
                            sx={{ padding: 0 }}
                        >
                            {message?.is_bookmarked ? (
                                <ReactSVG height={'18px'} width={'18px'} className='remove_bookmark_icon' src={IconSvg.bookmarkIcon} />
                            ) : (
                                <ReactSVG height={'18px'} width={'18px'} className='add_bookmark_icon' src={IconSvg.bookmarkIcon} />
                            )}
                        </Box>
                        {config?.APP_DETAILS?.feedback_status &&
                            <Tooltip title="Link" arrow>
                                <span>
                                    <Link
                                        sx={{ fontSize: 18, color: '#000000', cursor: 'pointer' }}
                                        onClick={handleClick}
                                    />
                                </span>
                            </Tooltip>
                        }
                    </Box>

                </Box>

                )
            }
        </Box >
    );
}

export default ChatMessages;