export const useStyles = (theme) => ({
    bookmarkChartContainer: {
        marginTop: '20px',
        marginBottom: '20px',
        height: '100%',
    },
    chatBoxChatContainer: {
        key: 'index',
        width: '100%',
        bgcolor: theme.palette.primary.main,
        borderRadius: '5px',
        border: `1px solid ${theme?.palette?.action.focus}`,
        marginBottom: '15px',
        padding: '15px',
        boxSizing: "border-box",
        marginTop: '20px'
    },
    chatBoxMessageContainer: {
        width: '100%',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        display: 'block',
        flexShrink: 1
    },
    chatMessages: {
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        textAlign: 'left',
        flexShrink: 1,
        overflow: 'hidden',
        transition: 'color 0.3s ease, text-decoration 0.3s ease'
    },
})
