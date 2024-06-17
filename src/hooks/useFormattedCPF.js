import { useState, useCallback } from 'react';

const formatCPF = (cpf) => {
    let formattedCpf = cpf.replace(/\D/g, ''); 
    if (formattedCpf.length > 11) formattedCpf = formattedCpf.slice(0, 11);
    if (formattedCpf.length > 3 && formattedCpf.length <= 6) {
        formattedCpf = formattedCpf.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (formattedCpf.length > 6 && formattedCpf.length <= 9) {
        formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (formattedCpf.length > 9) {
        formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
    return formattedCpf;
};

const useFormattedCPF = (initialValue) => {
    const [cpf, setCpf] = useState(formatCPF(initialValue));

    const handleSetCpf = useCallback((value) => {
        const onlyNumbers = value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        const formattedValue = formatCPF(onlyNumbers);
        setCpf(formattedValue);
    }, []);

    return [cpf, handleSetCpf];
};

export const validarCPF = (cpf) => {
    const cpfSemMascara = cpf.replace(/[^\d]/g, '');

    if (/^(\d)\1+$/.test(cpfSemMascara)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpfSemMascara.charAt(i)) * (10 - i);
    let primeiroDigito = (soma * 10) % 11;
    if (primeiroDigito === 10) primeiroDigito = 0;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpfSemMascara.charAt(i)) * (11 - i);
    let segundoDigito = (soma * 10) % 11;
    if (segundoDigito === 10) segundoDigito = 0;

    return (
        parseInt(cpfSemMascara.charAt(9)) === primeiroDigito &&
        parseInt(cpfSemMascara.charAt(10)) === segundoDigito
    );
};

export default useFormattedCPF;
