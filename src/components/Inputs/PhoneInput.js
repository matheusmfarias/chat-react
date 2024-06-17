import React, { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import './InputVerificado.css';

const PhoneInput = ({ label, name, value, onChange, title, required }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [isValid, setIsValid] = useState(!!value);
    const [hasValue, setHasValue] = useState(!!value);

    useEffect(() => {
        setInputValue(value);
        setIsValid(!!value);
        setHasValue(!!value);
    }, [value]);

    const handleChange = (event) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        setIsValid(!!newValue);
        setHasValue(!!newValue);
        onChange(event);
    };

    const getClassName = () => {
        let className = 'textbox__input';
        if (isValid) {
            className += ' valid';
        }
        if (hasValue) {
            className += ' has-value';
        }
        return className;
    };

    return (
        <div className="textbox-wrapper">
            <div className="textbox">
                <InputMask
                    mask="(99) 99999-9999"
                    value={inputValue}
                    onChange={handleChange}
                    title={title}
                    className={getClassName()}
                    required={required}
                >
                    {(inputProps) => <input {...inputProps} type="tel" name={name} />}
                </InputMask>
                <label htmlFor={name}>{label}</label>
            </div>
        </div>
    );
};

export default PhoneInput;
