import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './containers/App';
import { IntlProvider } from 'react-intl';
import "@fontsource/inter";
import { AppProvider } from './context/AppContext';

const userConfig = {
  third_party_token_provider: null,
  third_party_token: null
}

const chatbotConfig = {
  "WELCOME_MESSAGE": "",
  "APP_DETAILS": {
    "app_id": "c57c2d2c-1dfe-467c-a6a7-529c86665211",
    "app_name": "Test New",
    "app_description": "",
    "app_bot_type": "simple_bot",
    "app_launch_icon": "chatlaunch1",
    "app_logo_name": "ameya_analytics/analytics_logo/d5da89b3-a81f-4498-b95b-ddbedf1305e3/0c85bda2-f4a0-4e79-b0b9-4a881ae2450a/b134f978-52dd-4469-8d35-e18fecb074f4/c57c2d2c-1dfe-467c-a6a7-529c86665211.svg",
    "feedback_status": false,
    "feedback_url": ""
  },
  "APPFLYTE_ACCOUNT_CONFIGS": {
    "account_id": "a142e93d-7ce5-4fb5-bbd1-616378bfebb0",
    "subscriber_id": "d5da89b3-a81f-4498-b95b-ddbedf1305e3",
    "subscription_id": "0c85bda2-f4a0-4e79-b0b9-4a881ae2450a",
    "schema_id": "ameya_appflyte",
    "project_id": "b134f978-52dd-4469-8d35-e18fecb074f4"
  },
  "API_URL_CONFIGS": {
    "appflyte_backend_base_url": "https://appflyte-backend.smartfoodsafe.net",
    "analytics_base_url": "https://api.ameya.smartfoodsafe.net/ameya/analytics/v1"
  },
  "SOURCE_DETAILS": {
    "default_dataset": "files_e0c7bdae-abbe-4754-a0a9-87272d272785",
    "datasets": ["files_e0c7bdae-abbe-4754-a0a9-87272d272785"]
  },
  "UI_CONFIGS": {
    "font_family": "Inter",
    "font_color": "#000000",
    "background_color": "#EEEEEE",
    "surface_color": "#ffffff",
    "surface_border": "#ffffff",
    "button_fill": "#000000",
    "button_text": "#ffffff",
    "question_bubble_color": "#000000",
    "question_bubble_font_color": "#ffffff",
    "poweredby_logo_status": true
  },
  "AUTHENTICATION_CONFIGS": {
    "auth_type": "no_auth",
    "llm_type": "gemini",
    "service_agent_user_token_id": "914257d9-c0b4-4ed8-9b0b-11e1df3dde47",
    "service_agent_user_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYTE0MmU5M2QtN2NlNS00ZmI1LWJiZDEtNjE2Mzc4YmZlYmIwIiwic3Vic2NyaWJlcl9pZCI6ImQ1ZGE4OWIzLWE4MWYtNDQ5OC1iOTViLWRkYmVkZjEzMDVlMyIsInN1YnNjcmlwdGlvbl9pZCI6IjBjODViZGEyLWY0YTAtNGU3OS1iMGI5LTRhODgxYWUyNDUwYSIsIm9yZ2FuaXphdGlvbl9pZCI6IjZjYWFkYTg4LTJhYjEtNGY0ZS05ZDllLWQ5Njk1ZTZiMzI4MyIsInNlcnZpY2VfaWQiOiIxMzI5NWZiYi1lOGZhLTQyZWUtYjU5NS02MDVkZjVkMWQ1ZTUiLCJ3b3Jrc3BhY2VfaWQiOiJkZDg0M2Y0ZC1hNWMwLTRmNDEtYjM4ZS0xMGJlYmY3MjQ3YWQiLCJwcm9qZWN0X2lkIjoiYjEzNGY5NzgtNTJkZC00NDY5LThkMzUtZTE4ZmVjYjA3NGY0IiwidXNlcl9pZCI6IjEwMjUzMjc4MTAyNjE2NjI0MDAyNSIsInVzZXJfcm9sZSI6IjhiM2FjMmNkLTFkOGUtNGJkYS1hZjc5LTUxYTFiMDYwOTY4NyIsImdyb3VwX2lkIjoiW10iLCJyZXNvdXJjZV90eXBlIjp7ImVuZ2luZV90eXBlIjoiYW5hbHl0aWNzX3Rvb2wiLCJmdW5jdGlvbnMiOltdfSwiZXhwIjoxODA2NjQ3NDAwfQ.un9IHdM_t79bulz2dUiDWkvfOqjqDS7AJS0FNnqNvTM"
  }

}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <IntlProvider locale="en" messages={{}}>
    <AppProvider>
      <App config={{ ...chatbotConfig, ...userConfig }} />
    </AppProvider>
  </IntlProvider>
);
