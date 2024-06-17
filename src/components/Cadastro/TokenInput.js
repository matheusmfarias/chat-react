import React, { useState } from 'react';

const TokenInput = ({ length, onChange }) => {
    const [values, setValues] = useState(Array(length).fill(''));

    const handleChange = (e, index) => {
        const { value } = e.target;
        if (/^\d*$/.test(value)) {
            const newValues = [...values];
            newValues[index] = value;
            setValues(newValues);
            onChange(newValues.join(''));
            // Move to the next input if a digit is entered
            if (value && index < length - 1) {
                document.getElementById(`token-input-${index + 1}`).focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !values[index] && index > 0) {
            // Move to the previous input if Backspace is pressed and the current input is empty
            document.getElementById(`token-input-${index - 1}`).focus();
        }
    };

    return (
        <div className="token-input-container">
            {values.map((value, index) => (
                <input
                    key={index}
                    id={`token-input-${index}`}
                    type="text"
                    maxLength="1"
                    value={value}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="token-input"
                />
            ))}
        </div>
    );
};

export default TokenInput;
