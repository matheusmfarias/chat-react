import React, { useState, useEffect, useCallback } from 'react';
import './InputVerificado.css';
import api from '../../services/axiosConfig';

const InputVerificado = ({ type, label, name, onChange, maxLength, value, title, showButton, shouldValidate, min, max, disabled, required }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [isTyping, setIsTyping] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isValid, setIsValid] = useState(!shouldValidate || !!value);
    const [errorMessage, setErrorMessage] = useState('');

    const debounce = useCallback((callback, time) => {
        let interval;
        return (...args) => {
            clearTimeout(interval);
            interval = setTimeout(() => {
                callback.apply(null, args);
            }, time);
        };
    }, []);

    const updateUi = useCallback(async (value) => {
        setIsTyping(false);
        if (shouldValidate) {
            try {
                const response = await api.post(`${process.env.REACT_APP_API_URL}/api/user/check-availability`, {
                    [name]: value
                });

                const exists = name === 'email' ? response.data.emailExists : response.data.cpfExists;
                setIsValid(!exists && !!value);
                setIsButtonDisabled(exists || !value);
                setErrorMessage(exists ? `${label} não está disponível.` : '');
            } catch (error) {
                console.error('Erro ao verificar disponibilidade:', error);
                setIsValid(false);
                setIsButtonDisabled(true);
                setErrorMessage('Erro ao verificar disponibilidade.');
            }
        } else {
            setIsValid(!!value);
            setIsButtonDisabled(!value);
            setErrorMessage('');
        }
    }, [shouldValidate, name, label]);

    const handleStartTyping = () => {
        if (shouldValidate) {
            setIsTyping(true);
        }
    };

    const handleChange = (event) => {
        let { value } = event.target;
        
        if (name === 'cpf') {
            value = value.replace(/[^\d.-]/g, '');
        }
        setInputValue(value);
    
        if (shouldValidate) {
            debounce(() => {
                updateUi(value);
            }, 500)();
        }
    
        onChange({ target: { name, value } });
    };    

    const handleBlur = () => {
        if (shouldValidate) {
            updateUi(inputValue);
        }
    };

    const getClassName = () => {
        let className = 'textbox__input';
        if (isValid) {
            className += ' valid';
        }
        if (!isValid && inputValue) {
            className += ' invalid';
        }
        if (inputValue || name === "nascimento") {
            className += ' has-value';
        }
        if (disabled) {
            className += ' disabled-input';
        }
        return className;
    };

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <div className="textbox-wrapper">
            <div className="textbox">
                <input
                    onInput={handleChange}
                    onKeyDown={handleStartTyping}
                    onBlur={handleBlur}
                    autoComplete="off"
                    type={type}
                    id={name}
                    name={name}
                    maxLength={maxLength}
                    value={inputValue}
                    title={title}
                    min={min}
                    max={max}
                    className={getClassName()}
                    disabled={disabled}
                    required={required}
                />
                <label htmlFor={name}>{label}</label>
                {isTyping && <span className="spinner visible"></span>}
            </div>
            {!isValid && errorMessage && <span className="text-danger">{errorMessage}</span>}
            {showButton && (
                <button disabled={isButtonDisabled}>
                    <p>Cadastrar</p>
                </button>
            )}
        </div>
    );
};

export default InputVerificado;
