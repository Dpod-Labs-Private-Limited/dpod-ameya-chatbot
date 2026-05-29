import React, { useState, useEffect, memo, useContext } from 'react';
import { ReactSVG } from 'react-svg';

import { Avatar, Button, Box, Chip, Typography, IconButton, MenuItem, Menu, Select } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { East, Logout } from '@mui/icons-material';
import { useStyles } from './styles';
import "../ChatBotWindow/styles.css";

import { IconSvg } from '../../../styles/globalIcons';
import { jwtDecode } from 'jwt-decode';
import LogoPreview from './LogoPreview';
import { useAppContext } from '../../../context/AppContext';

const ChatSidebar = (props) => {
    const theme = useTheme();
    const styles = useStyles(theme);
    const { threadsData } = useAppContext();
    const { config, handleThreadSelection, setSelectedMenu, selectedMenu, setNewThread, setViewThreads } = props;

    const [isAuth, setIsAuth] = useState(false);
    const userInfo = { userName: "", userInital: "" }
    const [userData, setUserData] = useState(userInfo)

    useEffect(() => {
        try {
            const handleUserAuth = async () => {

                const auth_type = config?.AUTHENTICATION_CONFIGS?.auth_type ?? 'no_auth';

                if (auth_type === "auth") {

                    const user_token = JSON.parse(localStorage.getItem("agent-user-token"));
                    const decoded_token = jwtDecode(user_token?.token);
                    const userName = decoded_token?.name
                    let userInitial = "";

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
                                setUserData({ ...userData, userName: userName, userInital: userInitial });
                                setIsAuth(true);
                            }
                        } else {
                            console.warn("Invalid userName format (no @ or nothing before @):", userName);
                            userInitial = "?";
                            setUserData({ ...userData, userName: userName, userInital: userInitial });
                            setIsAuth(true);
                        }
                    }

                }
            }
            handleUserAuth();
        } catch (error) {
            console.log(error)
        }
    }, [config])

    const handleViewAll = () => {
        setViewThreads(true)
    };

    const handleMenuSelection = (item) => {
        setSelectedMenu(item)
        if (item === "Threads") {
            setViewThreads(true)
        } else {
            setViewThreads(false)
        }
    }

    const handleThreadSelect = (item) => {
        setViewThreads(false);
        setSelectedMenu("Threads")
        handleThreadSelection(item);
    }

    const menuItems = [
        { icon: IconSvg.homeIcon, label: 'Home', className: "" },
        { icon: IconSvg.bookmarkIcon, label: 'Bookmarks', className: "add_bookmark_icon" },
        { icon: IconSvg.threadsIcon, label: 'Threads', className: "" }
    ];

    // For Standalone App
    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    return (<Box margin="10px" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Box height="70px" display="flex" justifyContent="center" alignItems="center" mt="10px">
                <Box
                    width={204}
                    height={53}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        '& img, & svg': {
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        },
                    }}
                >
                    <LogoPreview config={config} />
                </Box>
            </Box>

            <Box height={"calc(100% - 190px)"}>

                <Box height={'100%'} >

                    <Box display="flex" justifyContent="center" mt={1}>
                        <Button sx={styles.threadButton}
                            onClick={() => setNewThread(true)}
                        >
                            <Typography sx={styles.btnText} >New Thread</Typography>
                        </Button>
                    </Box>

                    <Box sx={styles.menuContainer} >

                        <Box height={'100%'} >
                            <Box display="flex" justifyContent="center" >

                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    flexGrow={1}
                                    padding="20px"
                                >

                                    <Box>
                                        <ul className="chat-menu">
                                            {menuItems?.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className={`chat-menu-item ${selectedMenu === item.label ? 'active' : ''}`}
                                                    onClick={() => handleMenuSelection(item.label)}
                                                >
                                                    <span className="chat-icon">
                                                        <ReactSVG src={item.icon} className={item.className} />
                                                    </span>
                                                    <Typography className="chat-label" variant={selectedMenu === item.label ? "h3" : "h4"}>
                                                        {item.label}
                                                    </Typography>
                                                </li>
                                            ))}
                                        </ul>
                                    </Box>

                                    {threadsData?.length > 0 &&
                                        <>
                                            <Box display="flex" alignItems="center" mt={1} ml="25px">
                                                <Divider
                                                    orientation="vertical"
                                                    flexItem
                                                    sx={{ borderRightWidth: 1.5, color: "#666666", marginRight: '7px' }}
                                                />
                                                <Box sx={{ width: '150px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                    {threadsData?.length > 0 &&
                                                        threadsData
                                                            ?.slice()
                                                            ?.reverse()
                                                            ?.slice(0, 5)
                                                            ?.map((item, index) => (
                                                                <Box display="flex" alignItems="center" key={index}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            width: '100%',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            cursor: 'pointer',
                                                                            marginBottom: '5px',
                                                                            padding: '3px',
                                                                            paddingLeft: '6px',
                                                                            '&:hover': {
                                                                                backgroundColor: '#D9D9D9',
                                                                                borderRadius: '4px',
                                                                            },
                                                                        }}
                                                                        onClick={() => handleThreadSelect(item?.session_id)}
                                                                    >
                                                                        {item?.session_name}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                </Box>

                                            </Box>

                                            <Box ml="40px">
                                                {threadsData?.length > 3 && (
                                                    <Box display={'flex'} alignItems={'center'} alignSelf={'center'}>
                                                        <Typography
                                                            variant='h5'
                                                            sx={{ cursor: "pointer", marginTop: "5px", }}
                                                            onClick={() => { setSelectedMenu("Threads"); handleViewAll() }}
                                                        >
                                                            View all
                                                            <IconButton sx={{ marginLeft: '5px' }}>
                                                                <East sx={{ height: '14px', width: '14px', color: 'black' }} />
                                                            </IconButton>
                                                        </Typography>

                                                    </Box>
                                                )}
                                            </Box>
                                        </>
                                    }
                                </Box>

                            </Box>
                        </Box>

                    </Box>
                </Box>

            </Box>

            <Box sx={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                {isAuth &&
                    <Box display="flex" justifyContent="center">

                        <Box sx={{ maxWidth: '180px', display: 'flex', justifyContent: 'center' }}>
                            <Chip
                                avatar={
                                    <Avatar sx={{ bgcolor: '#000000', height: '32px', width: '32px' }}>
                                        <Typography
                                            variant="h5"
                                            sx={{ color: '#ffffff', padding: '5px' }}
                                        >
                                            {userData.userInital}
                                        </Typography>
                                    </Avatar>
                                }
                                label={
                                    <Box display={'flex'} alignItems={'center'}>
                                        <Typography
                                            variant="h5"
                                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        >
                                            {userData.userName}
                                        </Typography>

                                        {/* For Stand alone App */}
                                        {/* <Select
                                            value=""
                                            displayEmpty
                                            onChange={handleLogout}
                                            sx={{
                                                border: 'none',
                                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                width: "20%"
                                            }}
                                            MenuProps={{ disablePortal: true }}
                                        >
                                            <MenuItem
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.action.focus,
                                                    }
                                                }}
                                                onClick={handleLogout}>
                                                <Logout sx={{ fontSize: "14px", marginRight: "5px" }} />
                                                <Typography variant="h6" >Logout</Typography>
                                            </MenuItem>
                                        </Select> */}
                                    </Box>
                                }
                                sx={{
                                    padding: '10px 9px',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '20px',
                                    maxWidth: '100%',
                                    overflow: 'hidden'
                                }}
                            />
                        </Box>
                    </Box>
                }

                {!props?.config?.UI_CONFIGS?.poweredby_logo_status && (
                    <Box display="flex" justifyContent="center" mt={1}>
                        <ReactSVG src={IconSvg.poweredbyIcon} style={{ width: '106px' }} />
                    </Box>)
                }
            </Box>

        </Box>
    </Box >)
}
export default memo(ChatSidebar);
