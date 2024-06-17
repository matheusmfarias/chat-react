import React from 'react';
import './InputVerificado.css';

const SelectVerificado = ({ label, name, onChange, value, options, title }) => {
    return (
        <div className="textbox-wrapper">
            <div className="textbox">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    title={title}
                    className={`textbox__input ${value ? 'has-value' : ''}`}
                    required
                >
                    <option value="" disabled></option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <label htmlFor={name}>{label}</label>
            </div>
        </div>
    );
};

export default SelectVerificado;
