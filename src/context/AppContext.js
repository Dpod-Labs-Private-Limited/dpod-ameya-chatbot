import React, { createContext, useContext, useState } from 'react';
const AppContext = createContext();

export function AppProvider({ children }) {

    const [chatSourceState, setChatSourceState] = useState({})
    const [threadsData, setThreadsData] = useState([])
    const [bookmarkData, setBookmarkData] = useState([])
    const [threadAdded, setThreadAdded] = useState(false)
    const [bookmarkAdded, setBookmarkAdded] = useState(false)

    return (
        <AppContext.Provider
            value={{
                chatSourceState, setChatSourceState,
                threadsData, setThreadsData,
                bookmarkData, setBookmarkData,
                threadAdded, setThreadAdded,
                bookmarkAdded, setBookmarkAdded
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
