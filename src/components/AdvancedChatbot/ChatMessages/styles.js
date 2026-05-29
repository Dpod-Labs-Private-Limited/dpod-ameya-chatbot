export const getStyles = (theme) => ({
    chatBotBubble: {
        padding: '10px',
        marginBottom: '10px',
        minWidth: '20%',
        maxWidth: '80%',
    },
    botBorderStyle: {
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '10px',
        borderBottomLeftRadius: '10px',
        borderTopLeftRadius: '0',
    },
    userBorderStyle: {
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '0px',
        borderTopRightRadius: '10px',
    },
    chatBoxMessageContainer: {
        width: '100%',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        display: 'block',
        flexShrink: 1,
        overflow: 'hidden',
    },
    userMessageContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        bgcolor: theme.palette.primary.dark,
        borderRadius: '5px',
        marginBottom: '7px',
        gap: '5px',
        padding: '15px',
        boxSizing: "border-box"
    },
    botMessageContainer: {
        width: '100%',
        bgcolor: theme.palette.primary.main,
        borderRadius: '5px',
        border: `1px solid ${theme?.palette?.action.focus}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        position: "relative",
        marginBottom: '15px',
        padding: '15px',
        boxSizing: "border-box",
    },
    bookmarkContainer: {
        position: 'absolute',
        bottom: '-7px',
        right: '-5px',
        width: '65px',
        height: '27px',
        backgroundColor: '#EEEEEE',
        borderRadius: '5px',
        border: `1px solid ${theme?.palette?.action.focus}`,
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 10,
        padding: '0 5px'
    },
    chatMessages: {
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    chartGenerateBtn: {
        backgroundColor: theme.palette.action.active,
        color: theme.palette.text.primary,
        display: 'flex',
        alignItems: 'center',
        borderRadius: '5px',
        width: '160px',
        height: '30px',
        '&:hover': {
            backgroundColor: theme.palette.action.active,
            color: theme.palette.text.primary,
        },
    },
    btnText: {
        fontSize: '15px',
        fontWeight: 400,
        textTransform: 'none',
        color: theme.palette.text.primary,
        marginLeft: '5px'
    },
    chatCharts: {
        width: '100%',
        maxWidth: '100%',
        height: '400px',
        padding: '10px',
        backgroundColor: '#EEEEEE',
        borderRadius: '5px',
        margin: '15px 0',
        border: `1px solid ${theme?.palette?.action.focus}`,
        overflow: 'hidden',
        boxSizing: 'border-box'
    },
    progressContainer: {
        width: '100%',
        marginBottom: '7px',
        padding: '5px',
        boxSizing: "border-box",
        marginTop: 0
    },
    progressText: {
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontWeight: 400,
    },
    dropdowncontainer: {
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px",
        width: "125px",
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#D9D9D9',
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: '5px'
        },
    },
    dropdownicon: {
        marginLeft: "2px",
        color: '#000000'
    },
    dropdowncontent: (progress_status) => ({
        marginLeft: progress_status ? '15px' : 0,
        paddingLeft: '10px',
        borderLeft: `1px solid ${theme?.palette?.action.focus} `
    })
})
