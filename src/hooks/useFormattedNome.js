import { useState, useCallback } from 'react';

const useFormattedName = (initialValue) => {
    const [value, setValue] = useState(initialValue);

    const formatName = (name) => {
        return name.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    };

    const handleChange = useCallback((e) => {
        const formattedName = formatName(e.target.value);
        setValue(formattedName);
    }, []);

    return [value, handleChange];
};

export default useFormattedName;
