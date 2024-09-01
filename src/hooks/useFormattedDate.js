import { useCallback } from "react";

const useFormattedDate = () => {
    const formatDate = useCallback((date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('pt-BR', options);
    }, []);

    return { formatDate };
};

export default useFormattedDate;