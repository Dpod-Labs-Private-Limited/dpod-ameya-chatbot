import React, { useEffect } from 'react';
import { Box, CircularProgress, FormControl, IconButton, MenuItem, Select, Typography } from "@mui/material";
import AnalyticsChatsApi from '../../../api/services/AnalyticsChatsApi';
import { useTheme } from '@mui/material/styles';
import { useAppContext } from '../../../context/AppContext';
import { Refresh } from '@mui/icons-material';

const ChatSource = (props) => {

    const theme = useTheme();
    const { chatSourceState, setChatSourceState } = useAppContext();
    const { sourceLoading, setChatbotError, selectedSource, setSourceLoading, setSelectedSource, config } = props;

    useEffect(() => {
        fetchAllDataSource()
    }, [])

    const fetchAllDataSource = async () => {
        if (sourceLoading) return;
        setSourceLoading(true)
        try {
            let chat_datasets = []
            if ((chatSourceState || [])?.length > 0) {
                chat_datasets = chatSourceState
            } else {
                const response = await AnalyticsChatsApi.chatsetDetails();
                if (response.status === 200) {
                    const responseData = response?.data?.data ?? [];
                    if (responseData?.length > 0) {
                        const selected_datasets = config?.SOURCE_DETAILS?.datasets ?? [];
                        const filteredData = responseData.filter(item => selected_datasets.includes(item.dataset_id));
                        chat_datasets = filteredData
                    }
                }
            }
            const default_dataset_id = config?.SOURCE_DETAILS?.default_dataset ?? null;
            if (default_dataset_id) {
                const default_dataset = chat_datasets.find((item) => item?.dataset_id === default_dataset_id);
                if (default_dataset) {
                    setSelectedSource(default_dataset)
                }
            }
            setChatSourceState(chat_datasets)
        } catch (error) {
            console.log(error)
            setChatbotError("Failed to load data sources, try again.");
        } finally {
            setSourceLoading(false)
        }
    }

    const handleSourceChange = (event) => {
        const selectedId = event.target.value;
        const selectedItem = chatSourceState.find((item) => item.dataset_id === selectedId);
        setSelectedSource(selectedItem || null);
    };

    if (Object.keys(chatSourceState || {}).length === 0 && !config?.SOURCE_DETAILS?.default_source) {
        return (<Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Typography variant="h6" sx={{ m: 0, lineHeight: 1 }}>
                {sourceLoading ? "Data Source Loading" : "No Source Available"}
            </Typography>
            {sourceLoading ?
                (<CircularProgress size={14} sx={{ color: "#0B51C5" }} />) :
                (<IconButton size="small" sx={{ p: 0.5 }} onClick={fetchAllDataSource} disabled={sourceLoading}>
                    <Refresh sx={{ fontSize: 18 }} />
                </IconButton>)
            }
        </Box>);
    }

    return (
        <Box marginTop={'10px'} display={'flex'} justifyContent={'end'} alignItems={'center'}>
            <FormControl>
                <Select
                    labelId="expiration-label"
                    id="expiration"
                    value={selectedSource?.dataset_id || ""}
                    onChange={handleSourceChange}
                    size="small"
                    displayEmpty
                    MenuProps={{ disablePortal: true }}
                    variant="standard"
                    disableUnderline
                    sx={{
                        backgroundColor: theme.palette.primary.light,
                        "& .MuiSelect-select": {
                            padding: "3px",
                            backgroundColor: theme.palette.primary.light,
                        },
                        "& .MuiInputBase-root": {
                            border: "none !important",
                            boxShadow: "none !important",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none !important",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "none !important",
                        },
                        "& .MuiSelect-select.Mui-selected": {
                            backgroundColor: theme.palette.primary.light + " !important",
                        },
                        "& .MuiSelect-select.Mui-selected:focus": {
                            backgroundColor: theme.palette.primary.light + " !important",
                        },
                    }}
                >
                    <MenuItem value="" sx={{ "&:hover": { backgroundColor: theme.palette.action.focus } }}>
                        <Typography variant="body1" sx={{ fontWeight: 400 }}>
                            Select Dataset
                        </Typography>
                    </MenuItem>
                    {(chatSourceState || []).map((item) => (
                        <MenuItem
                            key={item.dataset_id}
                            value={item.dataset_id}
                            sx={{ "&:hover": { backgroundColor: theme.palette.action.focus } }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 400 }}>
                                {item?.dataset_name || ""}
                            </Typography>
                        </MenuItem>
                    ))}
                </Select>

            </FormControl>
        </Box>)
}

export default ChatSource;