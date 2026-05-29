import React, { useMemo, useCallback } from "react";
import moment from "moment/moment";
import { ReactSVG } from "react-svg";
import Plot from "react-plotly.js";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { IconSvg } from "../../../styles/globalIcons";
import { useStyles } from "./styles";
import "../ChatBotWindow/styles.css";

import { addChatToBookmark, removeChatToBookmark } from "../../../utils/getChatDetails";
import { useAppContext } from "../../../context/AppContext";
import BookmarkRenderer from "./BookmarkRenderer";

const DTYPE_READERS = {
    i1: (view, i) => view.getInt8(i),
    u1: (view, i) => view.getUint8(i),
    i2: (view, i, littleEndian) => view.getInt16(i, littleEndian),
    u2: (view, i, littleEndian) => view.getUint16(i, littleEndian),
    i4: (view, i, littleEndian) => view.getInt32(i, littleEndian),
    u4: (view, i, littleEndian) => view.getUint32(i, littleEndian),
    f4: (view, i, littleEndian) => view.getFloat32(i, littleEndian),
    f8: (view, i, littleEndian) => view.getFloat64(i, littleEndian),
};

const BYTE_SIZES = { i1: 1, u1: 1, i2: 2, u2: 2, i4: 4, u4: 4, f4: 4, f8: 8 };

const ChartItem = React.memo(({ chart, index }) => (
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
));

ChartItem.displayName = 'ChartItem';

const BookmarkItem = React.memo(({ item, index, styles, onBookmarkToggle }) => {

    const handleBookmarkClick = useCallback(() => {
        onBookmarkToggle(item.is_bookmarked, item.session_id, item.message_id);
    }, [item.is_bookmarked, item.session_id, item.message_id, onBookmarkToggle]);

    return (
        <Box sx={styles.chatBoxChatContainer} key={index}>
            <Box sx={{ ...styles.chatBoxMessageContainer, boxSizing: 'border-box', width: '100%' }}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems="flex-start" sx={{ whiteSpace: 'nowrap' }}>
                    <Typography
                        variant="h3"
                        sx={{ ...styles.chatMessages, textAlign: 'left', flexShrink: 1, overflow: 'hidden' }}
                    >
                        {item.user_chat}
                    </Typography>
                    <Box
                        marginLeft={'30px'}
                        display={'flex'}
                        alignItems={'center'}
                        onClick={handleBookmarkClick}
                        sx={{ flexShrink: 0, padding: 0, cursor: 'pointer' }}
                    >
                        <ReactSVG height={'12px'} width={'12px'} className="delete_icon" src={IconSvg.deleteIcon} />
                    </Box>
                </Box>

                {(item?.bot_chat)?.length > 0 && (item?.bot_chat)?.map((msg, mindex) =>
                    <Box key={mindex}>
                        {msg?.type === "chat" &&
                            (<Box sx={{ textAlign: 'left', color: 'black', }}>
                                <BookmarkRenderer displayData={msg.text} />
                            </Box>)
                        }
                        {msg?.type === "image" &&
                            (<Box sx={{ textAlign: 'center', width: '100%', marginTop: '5px' }}>
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

            </Box>

            {Array.isArray(item.chartData) && item.chartData.length > 0 && (
                <Box>
                    {item.chartData.map((chart, chartIndex) => (
                        <ChartItem key={chartIndex} chart={chart} index={chartIndex} />
                    ))}
                </Box>
            )}

            <Typography variant='h4' sx={{ ...styles.chatMessages, textAlign: 'left', marginTop: '10px' }}>
                {moment(item.created_at).format('DD MMM YYYY')}
            </Typography>
        </Box>
    );
});

BookmarkItem.displayName = 'BookmarkItem';

function ChatBookmarks(props) {
    const theme = useTheme();
    const styles = useStyles(theme);
    const { bookmarkData, setBookmarkAdded } = useAppContext();
    const { loading } = props;

    const decodeBase64Data = useCallback((base64String, dtype = "f8") => {
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

            const reader = DTYPE_READERS[type];
            const step = BYTE_SIZES[type];

            if (!reader || !step) {
                console.warn(`Unsupported dtype "${dtype}", falling back to uint8`);
                return Array.from(bytes);
            }

            const result = [];
            for (let i = 0; i < bytes.length; i += step) {
                const value = type.includes('2') || type.includes('4') || type.includes('f')
                    ? reader(view, i, littleEndian)
                    : reader(view, i);
                result.push(value);
            }

            return result.filter((v) => typeof v === "number" && !isNaN(v) && isFinite(v));
        } catch (err) {
            console.error("decodeBase64Data failed:", err);
            return [];
        }
    }, []);

    const getChartData = useCallback((item) => {
        if (!item?.chart) return null;

        const charts = Array.isArray(item.chart) ? item.chart : [item.chart];

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

                        if (dataItem?.y?.bdata) {
                            const dtype = dataItem.y.dtype || "f8";
                            const yValues = decodeBase64Data(dataItem.y.bdata, dtype);
                            newItem.y = yValues.length ? yValues : [];
                        }

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
    }, [decodeBase64Data]);

    const bookmarkDataDetails = useMemo(() => {
        if (!bookmarkData) return [];

        return bookmarkData.map((item) => {
            if (item?.chart) {
                const chartData = getChartData(item);
                return { ...item, chartData };
            }
            return item;
        });
    }, [bookmarkData, getChartData]);

    const reversedBookmarkData = useMemo(() =>
        bookmarkDataDetails.slice().reverse(),
        [bookmarkDataDetails]
    );

    const handleChatBookmark = async (is_bookmarked, session_id, message_id) => {
        try {
            const response = is_bookmarked ? await removeChatToBookmark(session_id, message_id) : await addChatToBookmark(session_id, message_id);
            if (response === true) {
                setBookmarkAdded(true);
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) {
        return (
            <Box marginTop={'20px'}>
                <Typography variant="h1">Bookmarks</Typography>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} marginTop={'80px'}>
                    <CircularProgress sx={{ color: '#0B51C5' }} />
                </Box>
            </Box>
        );
    }

    if (bookmarkData?.length === 0) {
        return (
            <Box marginTop={'20px'}>
                <Typography variant="h1">Bookmarks</Typography>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} marginTop={'80px'}>
                    <Typography variant="h5">No records to display</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box marginTop={'20px'}>
            <Typography variant="h1">Bookmarks</Typography>
            <Box sx={styles.bookmarkChartContainer}>
                {reversedBookmarkData.map((item, index) => (
                    <BookmarkItem
                        key={`${item.session_id}-${item.message_id}-${index}`}
                        item={item}
                        index={index}
                        styles={styles}
                        onBookmarkToggle={handleChatBookmark}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default ChatBookmarks;