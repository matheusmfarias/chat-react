import React, { useState, useEffect } from 'react';
import './AddAddress.css';
import InputVerificado from '../../Inputs/InputVerificado';
import axios from 'axios';

const AddAddress = ({ onNext, onBack }) => {
    const [addressData, setAddressData] = useState(() => {
        const savedAddress = localStorage.getItem('addressData');
        return savedAddress ? JSON.parse(savedAddress) : { street: '', number: '', district: '', city: '' };
    });

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const allFieldsFilled = Object.values(addressData).every(field => field.trim() !== '');
        setIsFormValid(allFieldsFilled);
    }, [addressData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddressData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        localStorage.setItem('addressData', JSON.stringify(addressData));
    }, [addressData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/user/address', addressData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            onNext();
        } catch (error) {
            console.error('Error saving address', error);
        }
    };

    return (
        <div className="address-setup-container">
            <h2>Adicionar endereço</h2>
            <p>Por favor, adicione seu endereço.</p>
            <form onSubmit={handleSubmit} className="address-form">
                <InputVerificado
                    type="text"
                    label="Rua"
                    name="street"
                    value={addressData.street}
                    onChange={handleChange}
                    title="Sua rua"
                    required
                />
                <InputVerificado
                    type="text"
                    label="Número"
                    name="number"
                    value={addressData.number}
                    onChange={handleChange}
                    title="Seu número"
                    required
                />
                <InputVerificado
                    type="text"
                    label="Bairro"
                    name="district"
                    value={addressData.district}
                    onChange={handleChange}
                    title="Seu bairro"
                    required
                />
                <InputVerificado
                    type="text"
                    label="Cidade"
                    name="city"
                    value={addressData.city}
                    onChange={handleChange}
                    title="Sua cidade"
                    required
                />
                <div className="form-buttons">
                    <button type="button" className="back-btn" onClick={onBack}>Voltar</button>
                    <button type="submit" className="submit-setup-btn" disabled={!isFormValid}>Avançar</button>
                </div>
            </form>
        </div>
    );
};

export default AddAddress;
