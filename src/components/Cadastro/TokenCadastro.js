import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "./TokenCadastro.css";
import TokenInput from './TokenInput';
import logo from '../../assets/images/logo-aci-transparente.png';

const TokenCadastro = ({ onVerify }) => {
    const [token, setToken] = useState('');
    const [erroToken, setErroToken] = useState('');
    const [tokenReenviado, setTokenReenviado] = useState('');
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60); // 60 segundos para o timer
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const emailUser = location.state?.email; // Obtendo o email do estado da navegação

    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email') || emailUser; // Usar o email do estado da navegação se disponível
    const urlToken = queryParams.get('token');

    useEffect(() => {
        if (urlToken) {
            setToken(urlToken);
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
    }, [canResend, urlToken]);

    useEffect(() => {
        const checkUserVerification = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/check-verification?email=${encodeURIComponent(email)}`);
                if (response.data.isVerified) {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Erro ao verificar o status do usuário:', error);
            }
        };

        if (email) {
            checkUserVerification();
        }
    }, [email, navigate]);

    const handleVerifyToken = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/verify', { email, token });
            setShowSuccessPopup(true);
            setTimeout(() => {
                onVerify();
                navigate('/login');
            }, 5000); // Redirecionar após 5 segundos
        } catch (error) {
            setErroToken('Token inválido ou expirado.');
            setTokenReenviado('');
        }
    };

    const handleResendToken = async () => {
        if (canResend) {
            try {
                await axios.post('http://localhost:5000/api/auth/resend-token', { email });
                setTokenReenviado('Token reenviado com sucesso!');
                setCanResend(false);
                setTimer(60); // Reiniciar o timer
                setErroToken('');
            } catch (error) {
                alert('Erro ao reenviar o token.');
            }
        }
    };

    return (
        <div className="container-token">
            <div className="form-token">
                <div className='logo-container-token'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <h2 className='p-2'>Verifique seu e-mail</h2>
                <form onSubmit={handleVerifyToken} className='verificacao-token'>
                    <div className="mb-3">
                        <label className="form-label">Um token de verificação foi enviado para <strong>{emailUser || email}</strong></label>
                        <TokenInput length={6} onChange={setToken} value={token} /> {/* Passando o valor do token */}
                        {erroToken && <div className="text-danger">{erroToken}</div>}
                        {tokenReenviado && <div className="text-success">{tokenReenviado}</div>}
                    </div>
                    <button type="submit" className="btn btn-primary">Verificar Token</button>
                </form>
                <button
                    type="button"
                    className="btn btn-secondary mt-3"
                    onClick={handleResendToken}
                    disabled={!canResend}
                >
                    {canResend ? 'Reenviar Token' : `Reenviar em ${timer}s`}
                </button>
            </div>
            {showSuccessPopup && (
                <>
                    <div className="overlay"></div>
                    <div className="success-popup">
                        <p>Cadastro realizado com sucesso! Você será redirecionado para o login.</p>
                        <p>Caso não seja redirecionado, clique <a href='/login'>aqui</a>.</p>
                    </div>
                </>
            )}
        </div>
    );
}

export default TokenCadastro;
