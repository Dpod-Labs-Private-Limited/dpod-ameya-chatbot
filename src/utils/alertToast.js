import { toast } from 'react-toastify';

export const tostAlert = (msg, mode) => {
    if (mode === 'success')
        toast.success(msg)
    else if (mode === 'info')
        toast.info(msg)
    else if (mode === 'warning')
        toast.warn(msg)
    else if (mode === 'error')
        toast.error(msg)
    else if (mode === 'custom_warning')
        toast.warning(msg)
}