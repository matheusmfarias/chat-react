import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './InputVerificado.css';

const InputVerificado = ({ type, label, name, onChange, maxLength, value, title, showButton, shouldValidate, min, max }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [isTyping, setIsTyping] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isValid, setIsValid] = useState(!shouldValidate || !!value);
    const [errorMessage, setErrorMessage] = useState('');

    const usernames = useMemo(() => ["017.448.080-66", "matheustroll0101@gmail.com"], []);

    useEffect(() => {
        if (!shouldValidate) {
            setIsButtonDisabled(false);
            setIsValid(true);
        }
    }, [shouldValidate]);

    const debounce = useCallback((callback, time) => {
        let interval;
        return (...args) => {
            clearTimeout(interval);
            interval = setTimeout(() => {
                callback.apply(null, args);
            }, time);
        };
    }, []);

    const updateUi = useCallback((value) => {
        setIsTyping(false);
        const usernameExists = usernames.some((u) => u === value);
        setIsValid(!usernameExists && !!value);
        setIsButtonDisabled(usernameExists || !value);
        setErrorMessage(usernameExists ? `${label} já está sendo utilizado.` : '');
    }, [usernames, label]);

    const handleStartTyping = () => {
        if (shouldValidate) {
            setIsTyping(true);
        }
    };

    const handleChange = (event) => {
        const { value } = event.target;
        setInputValue(value);
        if (shouldValidate) {
            debounce(() => {
                updateUi(value);
            }, 500)();
        }
        onChange(event);
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
                    required
                />
                <label htmlFor={name}>{label}</label>
                {isTyping && <span className="spinner visible"></span>}
            </div>
            {!isValid && errorMessage && <span className="error-message">{errorMessage}</span>}
            {showButton && (
                <button disabled={isButtonDisabled}>
                    <p>Cadastrar</p>
                </button>
            )}
        </div>
    );
};

export default InputVerificado;
