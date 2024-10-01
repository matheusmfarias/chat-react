import React, { useState, useEffect } from 'react';
import api from '../../../services/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import "../../Cadastro/TokenCadastro.css";
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import TokenInput from '../../Cadastro/TokenInput';

const VerifyEmail = () => {
    const [token, setToken] = useState('');
    const [erroToken, setErroToken] = useState('');
    const [tokenReenviado, setTokenReenviado] = useState('');
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60); // 60 segundos para o timer
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || localStorage.getItem('verificationEmail'); // Obtém o email do estado ou do localStorage

    useEffect(() => {
        if (!email) {
            navigate('/'); // Redireciona para a página inicial se o email não estiver disponível
        }

        if (!canResend) {
            const timerInterval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(timerInterval);
                        setCanResend(true);
                        return 60;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(timerInterval);
        }
    }, [canResend, email, navigate]);

    const handleVerifyToken = async (event) => {
        event.preventDefault();
        try {
            const authToken = localStorage.getItem('token'); // Token de autenticação
            await api.post(`${process.env.REACT_APP_API_URL}/api/user/verify-email`, { email, verificationToken: token }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            setShowSuccessPopup(true);
            setTimeout(() => {
                navigate('/login');
            }, 5000); // Redirecionar após 5 segundos
        } catch (error) {
            console.error('Erro ao verificar o código:', error.response?.data || error.message);
            setErroToken('Código inválido ou expirado.');
        }
    };

    const handleResendToken = async () => {
        if (canResend) {
            try {
                const authToken = localStorage.getItem('token');
                await api.post(`${process.env.REACT_APP_API_URL}/api/user/resend-email-token`, { email }, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                setTokenReenviado('Código reenviado com sucesso!');
                setCanResend(false);
                setTimer(60); // Reiniciar o timer
                setErroToken('');
            } catch (error) {
                alert('Erro ao reenviar o código.');
            }
        }
    };

    return (
        <>
            <HeaderCandidato />
            <div className="container-token">
                <div className="form-token">
                    <h2>Verifique seu e-mail</h2>
                    <form onSubmit={handleVerifyToken} className='verificacao-token'>
                        <div className="mb-3">
                            <label className="form-label">Um código de verificação foi enviado para <strong>{email}</strong></label>
                            <TokenInput length={6} onChange={setToken} value={token} /> {/* Passando o valor do token */}
                            {erroToken && <div className="text-danger">{erroToken}</div>}
                            {tokenReenviado && <div className="text-success">{tokenReenviado}</div>}
                        </div>
                        <button type="submit" className="btn btn-primary">Verificar código</button>
                    </form>
                    <button
                        type="button"
                        className="btn btn-secondary mt-3"
                        onClick={handleResendToken}
                        disabled={!canResend}
                    >
                        {canResend ? 'Reenviar código' : `Reenviar em ${timer}s`}
                    </button>
                </div>
                {showSuccessPopup && (
                    <>
                        <div className="overlay"></div>
                        <div className="success-popup">
                            <p>Seu e-mail foi atualizado com sucesso! Você será redirecionado para o login.</p>
                            <p>Caso não seja redirecionado, clique <a href='/login'>aqui</a>.</p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default VerifyEmail;