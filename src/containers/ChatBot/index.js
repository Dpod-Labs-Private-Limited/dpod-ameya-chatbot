import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Authentication from '../Authentication';
import ChatBotWindow from '../../components/AdvancedChatbot/ChatBotWindow';
import ChatBotHome from '../../components/SimpleChatbot';

const ChatBot = (props) => {
    const { config, botType, loading } = useMemo(() => props, [JSON.stringify(props || {})]);
    const [showAuthenticationView, setShowAuthenticationView] = useState(true);

    return (
        <Box >
            <ToastContainer
                position="top-center"
                autoClose={3500}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='colored'
            />
            {(showAuthenticationView || loading)
                ?
                (<Authentication
                    loading={loading}
                    config={config}
                    setShowAuthenticationView={setShowAuthenticationView}
                />)
                :
                (<>
                    {botType === "simple_bot" && <ChatBotHome config={config} />}
                    {botType === "advanced_bot" && <ChatBotWindow config={config} />}
                </>)
            }
        </Box>

    )
};

export default ChatBot;