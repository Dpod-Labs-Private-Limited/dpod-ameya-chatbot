import React, { useEffect, useState } from "react";
import moment from "moment/moment";
import { ReactSVG } from "react-svg";
import Plot from "react-plotly.js";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { IconSvg } from "../../../styles/globalIcons";
import { useStyles } from "./styles";
import "../ChatBotWindow/styles.css";

import { handleChatThreads } from "../../../utils/getChatDetails";
import AnalyticsChatsApi from "../../../api/services/AnalyticsChatsApi";
// import { apiErrorHandler } from "../../../utils/errorHandler";
import { useAppContext } from "../../../context/AppContext";
import ThreadRenderer from "./ThreadRenderer";

function ChatThreads(props) {

    const theme = useTheme();
    const styles = useStyles(theme);
    const { threadsData, setThreadAdded } = useAppContext();
    const { loading, setLoading, handleThreadSelection, setChatbotError } = props;
    const [threadsDetails, setThreadsDetails] = useState([]);

    useEffect(() => {
        fetchThreadDetails();
    }, [])

    const fetchThreadDetails = async () => {
        if (loading) return
        setLoading(true)
        try {
            const promises = threadsData?.map(async (item) => await handleChatThreads(item));
            const chatFlows = await Promise.all(promises);
            const allChatFlows = chatFlows.flat();
            setThreadsDetails(allChatFlows)
        } catch (error) {
            console.log(error)
            // apiErrorHandler(error)
        } finally {
            setLoading(false)
        }
    }

    const handleThreadsDelete = async (item) => {
        setLoading(true)
        try {
            const response = await AnalyticsChatsApi.deleteThread(item)
            if (response.status === 200) {
                setThreadAdded(true)
            }
        } catch (error) {
            console.log(error)
            // apiErrorHandler(error)
            setChatbotError("Something went wrong. Please try again.");
        } finally {
            setLoading(false)
        }
    }

    return (<Box marginTop={'20px'}>

        <Typography variant="h1">Threads</Typography>

        {loading &&
            (<Box display={'flex'} justifyContent={'center'} alignItems={'center'} marginTop={'80px'}>
                <CircularProgress sx={{ color: '#0B51C5' }} />
            </Box>)
        }

        {!loading && threadsData?.length === 0 &&
            (<Box display={'flex'} justifyContent={'center'} alignItems={'center'} marginTop={'80px'}>
                <Typography variant="h5">No records to display</Typography>
            </Box>)
        }

        {!loading && threadsDetails?.length > 0 &&
            (<Box sx={styles.bookmarkChartContainer}>
                {threadsDetails?.slice()?.reverse()?.map((item, index) => (
                    <Box sx={styles.chatBoxChatContainer} key={index}>

                        <Box sx={{ ...styles.chatBoxMessageContainer, boxSizing: 'border-box', width: '100%' }}>
                            <Box display={'flex'} justifyContent={'space-between'} alignItems="flex-start" sx={{ whiteSpace: 'nowrap' }}>
                                <Typography
                                    variant="h3"
                                    onClick={() => handleThreadSelection(item.session_id)}
                                    sx={{
                                        ...styles.chatMessages,
                                        '&:hover': {
                                            color: 'blue'
                                        },
                                        cursor: 'pointer'
                                    }}
                                >
                                    {item?.user_chat}
                                </Typography>
                                <Box
                                    marginLeft={'30px'}
                                    display={'flex'}
                                    alignItems={'center'}
                                    onClick={() => handleThreadsDelete(item?.session_id)}
                                    sx={{ flexShrink: 0, padding: 0 }}
                                >
                                    <ReactSVG height={'12px'} width={'12px'} className="delete_icon" src={IconSvg.deleteIcon} />
                                </Box>
                            </Box>

                            <Typography sx={{ color: 'black', textAlign: 'left' }}>
                                <ThreadRenderer displayData={item?.bot_chat} />
                            </Typography>

                        </Box>

                        {item?.chart && item?.chart?.data && item?.chart?.data.length > 0 && (
                            <Box sx={{ width: '100%', overflow: 'hidden' }}>
                                <Plot
                                    key={index}
                                    data={item?.chart?.data || []}
                                    layout={{
                                        ...(item?.chart?.layout || {}),
                                        autosize: true,
                                        margin: { l: 70, r: 50, t: 80, b: 120 },
                                        xaxis: { automargin: true, tickangle: -45, tickfont: { size: 10 } },
                                        yaxis: { automargin: true, tickfont: { size: 10 } },
                                        legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.2 },
                                    }}
                                    config={{ responsive: true }}
                                    style={{
                                        width: "100%",
                                        height: item?.chart?.layout?.height || '100%',
                                        borderRadius: '5px',
                                        marginTop: '15px'
                                    }}
                                />
                            </Box>
                        )}

                        <Typography variant='h4' sx={{ ...styles.chatMessages, textAlign: 'left', marginTop: '10px' }}>
                            {moment(item?.created_at)?.format('DD MMM YYYY')}
                        </Typography>

                    </Box>
                ))}

            </Box>)
        }

    </Box>)
}

export default ChatThreads;