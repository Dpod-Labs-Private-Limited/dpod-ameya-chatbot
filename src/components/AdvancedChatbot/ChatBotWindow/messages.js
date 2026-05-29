import { defineMessages } from 'react-intl';

export const scope = 'src.components.ChatBotWindow';

export default defineMessages({
  chatBot: {
    id: `${scope}.chatBot`,
    defaultMessage: 'ChatBot',
  },
  ameyaChatBotTitle: {
    id: `${scope}.ameyaChatBotTitle`,
    defaultMessage: 'ChatBot',
  },
  ameyaChatBotSubTitle: {
    id: `${scope}.ameyaChatBotSubTitle`,
    defaultMessage: 'Online',
  },
  poweredBy: {
    id: `${scope}.poweredBy`,
    defaultMessage: 'Powered by Ameya',
  },
  settingsTitle: {
    id: `${scope}.settingsTitle`,
    defaultMessage: 'Configurations',
  }
});
