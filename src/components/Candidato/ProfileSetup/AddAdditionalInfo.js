import React, { useState, useEffect } from 'react';
import './AddAdditionalInfo.css';
import PhoneInput from '../../Inputs/PhoneInput';
import SelectVerificado from '../../Inputs/SelectVerificado';
import axios from 'axios';

const AddAdditionalInfo = ({ onComplete, onBack }) => {
    const [userData, setUserData] = useState(() => {
        const savedData = localStorage.getItem('additionalInfoData');
        return savedData ? JSON.parse(savedData) : {
            maritalStatus: '',
            contactPhone: '',
            backupPhone: ''
        };
    });

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const allFieldsFilled = Object.values(userData).every(field => field.trim() !== '');
        setIsFormValid(allFieldsFilled);
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        localStorage.setItem('additionalInfoData', JSON.stringify(userData));
    }, [userData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/user/additional-info', userData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            await axios.post('http://localhost:5000/api/user/complete-setup', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Limpar valores armazenados no localStorage, mantendo apenas o token
            const token = localStorage.getItem('token');
            localStorage.clear();
            localStorage.setItem('token', token);
            onComplete();
        } catch (error) {
            console.error('Error updating additional info', error);
        }
    };

    return (
        <div className="additional-info-container">
            <h2>Informações Adicionais</h2>
            <form onSubmit={handleSubmit} className="additional-info-form">
                <SelectVerificado
                    label="Estado Civil"
                    id="maritalStatus"
                    name="maritalStatus"
                    value={userData.maritalStatus}
                    onChange={handleChange}
                    options={[
                        { value: 'solteiro', label: 'Solteiro(a)' },
                        { value: 'casado', label: 'Casado(a)' },
                        { value: 'divorciado', label: 'Divorciado(a)' },
                        { value: 'viuvo', label: 'Viúvo(a)' }
                    ]}
                    required
                />
                <PhoneInput
                    type="tel"
                    label="Telefone de Contato"
                    id="contactPhone"
                    name="contactPhone"
                    value={userData.contactPhone}
                    onChange={handleChange}
                    required
                />
                <PhoneInput
                    type="tel"
                    label="Telefone para Recado"
                    id="backupPhone"
                    name="backupPhone"
                    value={userData.backupPhone}
                    onChange={handleChange}
                    required
                />
                <div className="form-buttons">
                    <button type="button" className="back-btn" onClick={onBack}>Voltar</button>
                    <button type="submit" className="submit-btn" disabled={!isFormValid}>Finalizar</button>
                </div>
            </form>
        </div>
    );
};

export default AddAdditionalInfo;
