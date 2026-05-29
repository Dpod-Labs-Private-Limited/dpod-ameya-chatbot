import { jwtDecode } from "jwt-decode";

export const fetchAccountId = async () => {
    try {
        const dpod_token = JSON.parse(localStorage.getItem('service-agent-user-token'));
        if (dpod_token) {
            const decoded_dpod_token = jwtDecode(dpod_token);
            return decoded_dpod_token?.account_id ? decoded_dpod_token?.account_id : null
        } else {
            console.warn('Account ID not found.');
            return null;
        }
    } catch (error) {
        console.warn(error)
        return null
    }
};

export const fetchSubscriberId = async () => {
    try {
        const dpod_token = JSON.parse(localStorage.getItem('service-agent-user-token'));
        if (dpod_token) {
            const decoded_dpod_token = jwtDecode(dpod_token);
            return decoded_dpod_token?.subscriber_id ? decoded_dpod_token?.subscriber_id : null
        } else {
            console.warn('subscriber_id ID not found.');
            return null;
        }
    } catch (error) {
        console.warn(error)
        return null
    }
};

export const fetchSubscriptionId = async () => {
    try {
        const dpod_token = JSON.parse(localStorage.getItem('service-agent-user-token'));
        if (dpod_token) {
            const decoded_dpod_token = jwtDecode(dpod_token);
            return decoded_dpod_token?.subscription_id ? decoded_dpod_token?.subscription_id : null
        } else {
            console.warn('subscription_id not found.');
            return null;
        }
    } catch (error) {
        console.warn(error)
        return null
    }
};

export const getUserInitials = () => {
    try {
        const name = JSON.parse(localStorage.getItem('UserName'));
        if (!name) return "";
        const words = name.trim().split(" ");
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    } catch (error) {
        console.log(error)
    }
};

export const getUserName = () => {
    try {
        const name = JSON.parse(localStorage.getItem('UserName'));
        if (!name) return "";
        return name
    } catch (error) {
        console.log(error)
    }
};