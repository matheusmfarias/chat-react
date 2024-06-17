import React, { useState, useEffect } from 'react';
import './InputVerificado.css';

const AddressInput = ({ label, name, value, onChange, title, required }) => {
    const [address, setAddress] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [hasValue, setHasValue] = useState(!!value);
    const [isValid, setIsValid] = useState(!!value);

    useEffect(() => {
        setHasValue(!!value);
        setIsValid(!!value);
    }, [value]);

    const handleChange = async (event) => {
        const address = event.target.value;
        setAddress(address);
        setHasValue(!!address);
        setIsValid(!!address);
        onChange({ target: { name, value: address } });

        if (address.length > 2) {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=BR&q=${address}&addressdetails=1`);
            const results = await response.json();
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (suggestion) => {
        const formattedAddress = formatAddress(suggestion.address);
        setAddress(formattedAddress);
        setHasValue(true);
        setIsValid(true);
        onChange({ target: { name, value: formattedAddress } });
        setSuggestions([]);
    };

    const formatAddress = (address) => {
        const { road, house_number, suburb, city, state } = address;
        return `${road || ''} ${house_number || ''}, ${suburb || ''}, ${city || ''} - ${state || ''}`;
    };

    const getClassName = () => {
        let className = 'textbox__input';
        if (hasValue) {
            className += ' has-value';
        }
        if (isValid) {
            className += ' valid';
        }
        return className;
    };

    return (
        <div className="textbox-wrapper">
            <div className="textbox">
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={address}
                    onChange={handleChange}
                    title={title}
                    className={getClassName()}
                    required={required}
                />
                <label htmlFor={name}>{label}</label>
                {suggestions.length > 0 && (
                    <div className="autocomplete-dropdown-container">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.place_id}
                                className="suggestion-item"
                                onClick={() => handleSelect(suggestion)}
                            >
                                {formatAddress(suggestion.address)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressInput;
