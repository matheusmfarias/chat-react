import React, { useState, useEffect } from 'react';
import './AddAdditionalInfo.css';
import PhoneInput from '../../Inputs/PhoneInput';
import SelectVerificado from '../../Inputs/SelectVerificado';
import InputVerificado from '../../Inputs/InputVerificado';
import axios from 'axios';

const AddAdditionalInfo = ({ onComplete, onBack }) => {
    const [userData, setUserData] = useState(() => {
        const savedData = localStorage.getItem('additionalInfoData');
        return savedData ? JSON.parse(savedData) : {
            maritalStatus: '',
            contactPhone: '',
            backupPhone: '',
            rg: '',
            cnh: '', // Inicializando como 'Não tenho'
            cnhTypes: [] // Inicializando como array vazio
        };
    });

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const allFieldsFilled = Object.entries(userData).every(([key, value]) => {
            if (key === 'rg' || key === 'cnhTypes') {
                return true; // Esses campos não são obrigatórios
            }
            if (typeof value === 'string') {
                return value.trim() !== '';
            }
            return true;
        });

        const isCnhValid = userData.cnh === 'Não tenho' || (userData.cnh === 'Tenho' && userData.cnhTypes.length > 0);

        setIsFormValid(allFieldsFilled && isCnhValid);
    }, [userData]);

    // Lida com mudanças nos campos de texto
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Lida com o campo RG
    const handleRgChange = (e) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value)) {
            setUserData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    // Lida com a mudança de CNH (Tenho ou Não tenho)
    const handleCnhChange = (e) => {
        const { value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            cnh: value,
            cnhTypes: value === 'Tenho' ? prevState.cnhTypes || [] : [] // Limpa cnhTypes se "Não tenho" for selecionado
        }));
    };

    // Lida com os checkboxes dos tipos de CNH
    const handleCnhTypesChange = (e) => {
        const { value, checked } = e.target;
        setUserData(prevState => {
            const newCnhTypes = checked
                ? [...(prevState.cnhTypes || []), value] // Adiciona tipo de CNH se marcado
                : (prevState.cnhTypes || []).filter(type => type !== value); // Remove tipo de CNH se desmarcado
            return {
                ...prevState,
                cnhTypes: newCnhTypes
            };
        });
    };

    // Salva os dados no localStorage sempre que o userData for alterado
    useEffect(() => {
        localStorage.setItem('additionalInfoData', JSON.stringify(userData));
    }, [userData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const dataToSend = {
            ...userData,
            cnh: userData.cnh === 'Tenho', // Converte para booleano: true para "Tenho" e false para "Não tenho"
        };
    
        console.log("Dados enviados:", dataToSend); // Verificar os dados corrigidos
    
        try {
            await axios.post('http://localhost:5000/api/user/additional-info', dataToSend, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            await axios.post('http://localhost:5000/api/user/complete-setup', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
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
                <InputVerificado
                    type="text"
                    label="RG"
                    id="rg"
                    name="rg"
                    maxLength="10"
                    value={userData.rg}
                    onChange={handleRgChange}
                />
                <SelectVerificado
                    label="CNH"
                    id="cnh"
                    name="cnh"
                    value={userData.cnh}
                    onChange={handleCnhChange}
                    options={[
                        { value: 'Tenho', label: 'Tenho' },
                        { value: 'Não tenho', label: 'Não tenho' }
                    ]}
                    required
                />
                {userData.cnh === 'Tenho' && (
                    <div className="cnh-types-container">
                        <div className="cnh-types-checkboxes">
                            {['A', 'B', 'C', 'D', 'E'].map(type => (
                                <label key={type}>
                                    <input
                                        type="checkbox"
                                        value={type}
                                        checked={(userData.cnhTypes || []).includes(type)} // Garante que o checkbox esteja marcado
                                        onChange={handleCnhTypesChange}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                <div className="form-buttons">
                    <button type="button" className="back-btn" onClick={onBack}>Voltar</button>
                    <button
                        type="submit"
                        className="submit-setup-btn"
                        disabled={
                            !isFormValid ||
                            (userData.cnh === 'Tenho' && userData.cnhTypes.length === 0) // Validação: pelo menos um tipo de CNH selecionado
                        }
                    >
                        Finalizar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAdditionalInfo;
