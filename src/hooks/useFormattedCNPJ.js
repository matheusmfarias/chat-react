import { useState, useCallback } from 'react';

export const formatCNPJ = (cnpj) => {
    let formattedCnpj = cnpj.replace(/\D/g, ''); // Remove qualquer caractere não numérico
    if (formattedCnpj.length > 14) formattedCnpj = formattedCnpj.slice(0, 14);
    if (formattedCnpj.length > 2 && formattedCnpj.length <= 5) {
        formattedCnpj = formattedCnpj.replace(/(\d{2})(\d+)/, '$1.$2');
    } else if (formattedCnpj.length > 5 && formattedCnpj.length <= 8) {
        formattedCnpj = formattedCnpj.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (formattedCnpj.length > 8 && formattedCnpj.length <= 12) {
        formattedCnpj = formattedCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else if (formattedCnpj.length > 12) {
        formattedCnpj = formattedCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    }
    return formattedCnpj;
};

const useFormattedCNPJ = (initialValue) => {
    const [cnpj, setCnpj] = useState(formatCNPJ(initialValue));

    const handleSetCnpj = useCallback((value) => {
        const onlyNumbers = value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        const formattedValue = formatCNPJ(onlyNumbers);
        setCnpj(formattedValue);
    }, []);

    return [cnpj, handleSetCnpj];
};

export default useFormattedCNPJ;
