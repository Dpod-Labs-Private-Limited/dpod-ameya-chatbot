// src/theme.js
import React, { useMemo } from 'react';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';

import ChatBot from '../ChatBot';
import defaultTheme from '../../styles/theme';
import configService from '../../api/services/configService';

const App = (props) => {

    const config = useMemo(() => props.config, [JSON.stringify(props.config || {})]);

    const [theme, setTheme] = useState(defaultTheme);
    const [loading, setLoading] = useState(true);
    const [botType, setBotType] = useState('simple_bot');

    useEffect(() => {
        if (config?.UI_CONFIGS) {
            fetchChatConfigurations();
        }
    }, [config]);

    const fetchChatConfigurations = async () => {
        try {
            const ui_configs = config?.UI_CONFIGS ?? {};
            const app_bot_type = config?.APP_DETAILS?.app_bot_type || 'simple_bot';
            const fetchedTheme = await configService.fetchThemeConfig(ui_configs);
            setBotType(app_bot_type);
            setTheme(fetchedTheme ?? defaultTheme);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <ChatBot
                config={config}
                botType={botType}
                loading={loading}
            />
        </ThemeProvider>
    );
};

export default App;