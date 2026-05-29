
export const useStyles = (theme) => ({
    '@keyframes slideIn': {
        from: { transform: 'translateY(100%)' },
        to: { transform: 'translateY(0)' },
    },
    launchButton: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        backgroundColor: theme.palette.secondary.main,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "fixed !important",
        bottom: "1.5rem !important",
        right: "1.5rem !important",
        zIndex: 1000,
        padding: 0,
        minWidth: "unset",
        border: "none",
        outline: "none",
        "&:hover": {
            transform: "scale(1.08)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
        },
        "&:active": {
            transform: "scale(0.95)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        },
        "&:focus-visible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: "2px",
        },
        "& svg": {
            transition: "transform 0.3s ease",
        },
        "&:hover svg": {
            transform: "rotate(15deg)",
        },
    },
    chatBotMainWindow: {
        top: 0,
        left: 0,
        padding: 0,
        margin: 0,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'space-between',
        position: "fixed",
        zIndex: 9999,
        backgroundColor: theme.palette.primary.main,
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        }
    },
    chatBotSidebarContainer: {
        height: '100vh',
        width: '18%',
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            height: 'auto',
        },
    },
    chatBotMainContainer: {
        height: '100vh',
        width: 'calc(100% - 18%)',
        backgroundColor: theme.palette.primary.main,
    },
    closeBtn: {
        position: "absolute",
        top: "12px",
        right: "12px",
        zIndex: 10,
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        color: "#444",
        backgroundColor: theme.palette.primary.main,
        backdropFilter: "blur(4px)",
        transition: "all 0.25s ease"
    },
    chatBotSubContainer: {
        height: "calc(100% - 20px)",
        width: "calc(100% - 20px)",
        margin: '10px',
        borderRadius: '10px',
        backgroundColor: theme.palette.secondary.main,
    },
    chatCloseContainer: {
        height: '40px',
        display: 'flex',
        justifyContent: 'end',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        backgroundColor: theme.palette.secondary.main
    },
    chatBotMessageContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        overflowY: "scroll",
        overflowX: 'hidden',
        height: 'calc(100% - 14%)',
        flexgrow: '1',
        scrollbarWidth: 'thin',
        scrollbarColor: '#d3d3d3 transparent',
        '&::-webkit-scrollbar': {
            width: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#d3d3d3',
            borderRadius: '5px',
        },
    },
    chatBotWindowBody: {
        height: '100%',
        width: "90%",
        color: "black",
        backgroundColor: theme.palette.secondary.main,
    },
    chatBookmarkContainer: {
        height: '98%',
        width: "100%",
        display: "flex",
        justifyContent: "center",
        overflowY: "auto",
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: '#d3d3d3 transparent',
        '&::-webkit-scrollbar': {
            width: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#d3d3d3',
            borderRadius: '5px',
        },
    },
    chatBookmarkBody: {
        height: '100%',
        width: "90%",
        color: "black",
        backgroundColor: theme.palette.secondary.main
    },
    chatThredContainer: {
        height: '98%',
        width: "100%",
        display: "flex",
        justifyContent: "center",
        overflowY: "auto",
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: '#d3d3d3 transparent',
        '&::-webkit-scrollbar': {
            width: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#d3d3d3',
            borderRadius: '5px',
        },
    },
    chatThreadBody: {
        height: '100%',
        width: "90%",
        color: "black",
        backgroundColor: theme.palette.secondary.main
    },
    progressContainer: {
        width: '100%',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '5px',
        border: `1px solid ${theme?.palette?.action.focus}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        position: "relative",
        marginBottom: '15px',
        padding: '15px',
        boxSizing: "border-box"
    },
    progressText: {
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontWeight: 400,
    }
})