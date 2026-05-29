import { tostAlert } from "./alertToast";

export const apiErrorHandler = (err) => {

    console.log(err);
    if (err?.response) {
        const { data } = err.response;
        console.log(data);

        if (!data) {
            tostAlert('Something went wrong while fetching files', 'error')
            return;
        }

        if (data?.schema_errors) {
            tostAlert('Please check all fields and retry', 'error')
            return;
        }

        if (data?.detail) {
            alert(data.detail);
            return;
        }

        if (data?.message) {
            if (typeof data.message === 'object' && "code" in data.message) {
                tostAlert(handleErrorCode(data.message), 'error')
            } else {
                tostAlert(data.message, 'error')
            }
            return;
        }

        tostAlert('Something went wrong while Fetching Data', 'error')
    } else if (err?.message === "Network Error") {
        tostAlert('Something went wrong while Fetching Data', 'error')
    } else {
        tostAlert('An unexpected error occurred', 'error')

    }
};
