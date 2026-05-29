/*
 * Finances Messages
 *
 * This contains all the text for the Finances container.
 */

import { defineMessages } from 'react-intl';

export const scope = 'src.components.ChatBotBubble';

export default defineMessages({
  bot: {
    id: `${scope}.bot`,
    defaultMessage: 'Bot',
  },
  you: {
    id: `${scope}.you`,
    defaultMessage: 'You',
  },
});
