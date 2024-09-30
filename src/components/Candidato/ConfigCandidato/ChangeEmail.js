import React, { useState, useEffect } from 'react';
import './ChangeEmail.css';
import api from '../../../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import InputVerificado from '../../Inputs/InputVerificado';

const ChangeEmail = () => {
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false); // novo estado para verificar se o email já foi checado
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCurrentEmail = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/candidato`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCurrentEmail(response.data.email);
            } catch (error) {
                console.error('Erro ao buscar o e-mail atual', error);
            }
        };

        fetchCurrentEmail();
    }, []);

    useEffect(() => {
        setIsFormValid(newEmail && newEmail === confirmEmail && isEmailAvailable && emailChecked);
    }, [newEmail, confirmEmail, isEmailAvailable, emailChecked]);

    const handleChange = async (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setNewEmail(value);

            try {
                const response = await api.post(`${process.env.REACT_APP_API_URL}/api/user/check-availability`, {
                    email: value
                });

                setIsEmailAvailable(!response.data.emailExists);
                setEmailChecked(true);
            } catch (error) {
                console.error('Erro ao verificar disponibilidade de e-mail:', error);
                setIsEmailAvailable(false);
                setEmailChecked(true);
            }
        } else if (name === 'confirmEmail') {
            setConfirmEmail(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.post(`${process.env.REACT_APP_API_URL}/api/user/change-email`, { email: newEmail }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Um token de confirmação foi enviado para seu novo e-mail.');
            localStorage.setItem('verificationEmail', newEmail); // Armazena o email novo para verificação
            navigate('/verify-email', { state: { email: newEmail } });
        } catch (error) {
            console.error('Erro ao solicitar a alteração de e-mail', error);
            setMessage('Erro ao solicitar a alteração de e-mail. Tente novamente.');
        }
    };

    return (
        <>
            <HeaderCandidato />
            <main className='change-email-content'>
                <div className="change-email-container">
                    <form onSubmit={handleSubmit} className="change-email-form">
                        <h2>Alteração de e-mail</h2>
                        <div className="form-group">
                            <InputVerificado
                                type="email"
                                label="E-mail atual"
                                id="currentEmail"
                                name="currentEmail"
                                value={currentEmail}
                                onChange={handleChange}
                                title="Seu e-mail atual"
                                disabled
                                className="disabled-input"
                            />
                        </div>
                        <div className="form-group">
                            <InputVerificado
                                type="email"
                                label="E-mail novo"
                                id="email"
                                name="email"
                                maxLength="55"
                                value={newEmail}
                                onChange={handleChange}
                                title="Seu e-mail novo"
                                shouldValidate={true}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <InputVerificado
                                type="email"
                                label="Confirme o e-mail novo"
                                id="confirmEmail"
                                name="confirmEmail"
                                maxLength="55"
                                value={confirmEmail}
                                onChange={handleChange}
                                title="Confirme seu e-mail novo"
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn" disabled={!isFormValid}>Alterar</button>
                    </form>
                    {message && <p>{message}</p>}
                </div>
            </main>
        </>
    );
};

export default ChangeEmail;
