import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
};

export const showToast = (message, type) => {
    switch (type) {
        case TOAST_TYPES.SUCCESS:
            toast.success(message);
            break;
        case TOAST_TYPES.ERROR:
            toast.error(message);
            break;
        case TOAST_TYPES.INFO:
            toast.info(message);
            break;
        case TOAST_TYPES.WARNING:
            toast.warn(message);
            break;
        default:
            toast(message);
            break;
    }
};

const ToastNotification = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            closeOnClick={true}
            pauseOnHover={true}
            draggable={true}
            closeButton={false}
        />
    );
};

export default ToastNotification;