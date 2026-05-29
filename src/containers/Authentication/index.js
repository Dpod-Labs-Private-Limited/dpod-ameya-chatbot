import React, { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { handleUserAuthentication } from "./authHandle";

const Authentication = (props) => {

    const { loading, config, setShowAuthenticationView } = props;
    const [authLoading, setAuthLoading] = useState(true);
    const [unAuthorized, setUnAuthorized] = useState(false);
    const [isServiceAgentTokenExpiring, setIsServiceAgentTokenExpiring] = useState(false);
    const [serviceAgentTokenStatus, setServiceAgentTokenStatus] = useState(true);

    useEffect(() => {
        checkAuthentication();
    }, [config]);

    const checkAuthentication = async () => {
        setAuthLoading(true);
        try {
            const auth_response = await handleUserAuthentication(config);
            if (!auth_response) {
                setShowAuthenticationView(false);
            } else if (auth_response === "no_service_token") {
                setServiceAgentTokenStatus(false);
            } else if (auth_response === "service_token_expired") {
                setIsServiceAgentTokenExpiring(true);
            } else if (auth_response === "unauthorized") {
                setUnAuthorized(true);
            }
        } catch (error) {
            console.error("Authentication error:", error);
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <Box sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "white",
            zIndex: 9999,
        }}>

            <Box display="flex" justifyContent="center" alignItems={'center'} height="95%">
                {(authLoading || loading) &&
                    ((<Box display="flex" justifyContent="center" alignItems={'center'} height="95%">
                        <Box>
                            <CircularProgress variant="indeterminate" />
                            <Typography variant="h4" marginTop={'5px'}>Loading ...</Typography>
                        </Box>
                    </Box>))
                }

                {(!loading && !authLoading && unAuthorized) && (
                    <Box>
                        <Typography variant="h3" color="red">
                            Access denied. Reach out to your admin for help.
                        </Typography>
                    </Box>
                )}

                {(!loading && !authLoading && isServiceAgentTokenExpiring) && (
                    <Box>
                        <Typography variant="h3" color="red">
                            Access denied. Reach out to your admin for help.
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'red', textAlign: 'center' }}>
                            Service token is expired.
                        </Typography>
                    </Box>
                )}
                {(!loading && !authLoading && !serviceAgentTokenStatus) && (
                    <Box>
                        <Typography variant="h3" color="red">
                            Access denied. Reach out to your admin for help.
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'red', textAlign: 'center' }}>
                            Service token not available.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default Authentication;