import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './containers/App';
import { IntlProvider } from 'react-intl';
import "@fontsource/inter";
import { AppProvider } from './context/AppContext';

const renderChatBot = (config) => {
    const locale = 'en';
    const messages = {};

    const rootElement = document.createElement('div');
    rootElement.id = 'ameya-chatbot-root';
    document.body.appendChild(rootElement);
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <IntlProvider locale={locale} messages={messages}>
            <AppProvider>
                <App config={config} />
            </AppProvider>
        </IntlProvider>
    );
};

window.AmeayaChatBot = (function () {
    let initialized = false;
    return function (command, config) {
        if (command === 'init' && !initialized) {
            initialized = true;
            renderChatBot(config);
        } else {
            console.warn('ChatBot already initialized or invalid command.');
        }
    };
})();
