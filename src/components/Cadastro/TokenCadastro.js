import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import "./TokenCadastro.css";
import TokenInput from './TokenInput';
import logo from '../../assets/images/logo-aci-transparente.png';

const TokenCadastro = ({ onVerify }) => {
    const [token, setToken] = useState('');
    const [erroToken, setErroToken] = useState('');
    const [tokenReenviado, setTokenReenviado] = useState('');
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [message, setMessage] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const email = location.state?.email || queryParams.get('email') || localStorage.getItem('email');
    const urlToken = queryParams.get('token');
    const verified = queryParams.get('verified');

    useEffect(() => {
        document.title = "ACI Empregos | Cadastro";

        if (!canResend) {
            const timerInterval = setInterval(() => {
                setTimer((prevTimer) => {
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
    }, [canResend]);

    useEffect(() => {
        if (urlToken && email) {
            api.post(`${process.env.REACT_APP_API_URL}/api/auth/verify`, { email, token: urlToken })
                .then(() => {
                    setMessage(`
                    <div>
                        <p>Cadastro realizado com sucesso! Você será redirecionado para o login.</p>
                        <p>Caso não seja redirecionado, clique <a href='/login'>aqui</a>.</p>
                    </div>
                    `);
                    setTimeout(() => {
                        navigate('/login');
                    }, 5000);
                })
                .catch(() => {
                    setErroToken('Token inválido ou expirado.');
                });
        }
    }, [urlToken, email, navigate]);

    useEffect(() => {
        if (verified === 'success') {
            setMessage(`
                <p>Cadastro realizado com sucesso! Você será redirecionado para o login.</p>
                <p>Caso não seja redirecionado, clique <a href='/login'>aqui</a>.</p>
            `);
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        }
    }, [verified, navigate]);

    const handleVerifyToken = async (event) => {
        event.preventDefault();
        if (!email) {
            setErroToken('Erro: E-mail não encontrado.');
            return;
        }
        try {
            await api.post(`${process.env.REACT_APP_API_URL}/api/auth/verify`, { email, token });
            localStorage.removeItem('email');
            setMessage(`
                <p>Cadastro realizado com sucesso! Você será redirecionado para o login.</p>
                <p>Caso não seja redirecionado, clique <a href='/login'>aqui</a>.</p>
            `);
            setTimeout(() => {
                if (typeof onVerify === 'function') {
                    onVerify();
                }
                navigate('/login');
            }, 5000);
        } catch {
            setErroToken('Token inválido ou expirado.');
        }
    };

    const handleResendToken = async () => {
        if (canResend && email) {
            try {
                await api.post(`${process.env.REACT_APP_API_URL}/api/auth/resend-token`, { email });
                setTokenReenviado('Código reenviado com sucesso!');
                setCanResend(false);
                setTimer(60);
                setErroToken('');
            } catch {
                alert('Erro ao reenviar o código.');
            }
        }
    };

    return (
        <div className="container-token">
            <div className="form-token">
                <div className="logo-container-token">
                    <a href="/" rel="noreferrer">
                        <img src={logo} alt="Logo" loading="lazy" />
                    </a>
                </div>
                {message ? (
                    <div
                        className="alert alert-success"
                        dangerouslySetInnerHTML={{ __html: message }} // Renderiza o HTML no conteúdo
                    ></div>
                ) : (
                    <>
                        <h2 className="p-2">Verifique seu e-mail</h2>
                        <form onSubmit={handleVerifyToken} className="verificacao-token">
                            <div className="mb-3">
                                <label className="form-label">
                                    Um código de verificação foi enviado para <strong>{email}</strong>
                                </label>
                                <TokenInput length={6} onChange={setToken} value={token} />
                                {erroToken && <div className="text-danger">{erroToken}</div>}
                                {tokenReenviado && <div className="text-success">{tokenReenviado}</div>}
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Verificar código
                            </button>
                        </form>
                        <button
                            type="button"
                            className="btn btn-secondary mt-3"
                            onClick={handleResendToken}
                            disabled={!canResend}
                        >
                            {canResend ? 'Reenviar código' : `Reenviar em ${timer}s`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

TokenCadastro.defaultProps = {
    onVerify: () => {}, // Valor padrão
};

export default TokenCadastro;
