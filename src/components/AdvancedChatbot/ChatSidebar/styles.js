export const useStyles = (theme) => ({
    '@keyframes slideIn': {
        from: { transform: 'translateY(100%)' },
        to: { transform: 'translateY(0)' },
    },

    chatBotSidebarWindow: {
        height: '100%',
        width: '250px',
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            height: 'auto',
        },
    },
    main_logo: {
        height: "53px",
        width: "204px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    menuContainer: {
        height: 'calc(100% - 50px)',
        overflowY: 'auto',
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
        animation: 'slideOut 0.3s ease-out',
    },
    threadButton: {
        backgroundColor: theme.palette.action.active,
        color: theme.palette.text.primary,
        borderRadius: '20px',
        width: '150px',
        height: '40px',
        '&:hover': {
            backgroundColor: theme.palette.action.active,
            color: theme.palette.text.primary,
        },
    },
    btnText: {
        fontSize: '16px',
        fontWeight: 600,
        textTransform: 'none',
        color: theme.palette.text.primary
    }
})