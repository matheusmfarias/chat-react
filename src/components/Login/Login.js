import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from '../../services/axiosConfig';
import logo from '../../assets/images/logo-aci-transparente.png';
import SenhaInput from "../SenhaInput/SenhaInput";
import './Login.css';
import { useNavigate, useLocation } from 'react-router-dom';
import InputVerificado from "../Inputs/InputVerificado";
import { Spinner } from "react-bootstrap";

const Login = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const verified = params.get('verified');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erroLogin, setErroLogin] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.clear();
        Cookies.remove('userId'); // Remove cookies antigos (opcional)
        document.title = "ACI Empregos | Login";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, senha });

            const { token, userId, firstLogin, role } = response.data;

            // Armazena o token no localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            // Armazena o userId nos cookies
            Cookies.set('userId', userId, { expires: 7 }); // Expira em 7 dias

            // Navegação baseada no status do usuário
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else if (firstLogin) {
                navigate('/profile-setup');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            if (error.response) {
                setErroLogin(error.response.data);
            } else {
                setErroLogin('Erro ao fazer login. Por favor, tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-login">
            <div className="form-login">
                <div className='logo-container-login'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                {verified === 'success' && <div className="alert alert-success">Seu e-mail foi verificado com sucesso!</div>}
                <h2>Entre na sua conta</h2>
                <form onSubmit={handleSubmit} className="credencial-login">
                    <InputVerificado
                        type="email"
                        label="E-mail"
                        id="email"
                        name="email"
                        maxLength="55"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        title="Seu e-mail"
                        required
                    />
                    <SenhaInput
                        label="Senha"
                        name="senha"
                        placeholder="Insira sua senha"
                        title="Sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        showRequirements={false}
                        required
                    />
                    {erroLogin && <div className='text-danger'>{erroLogin}</div>}
                    <button type="submit" className="btn btn-primary btn-entrar">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center">
                                <Spinner animation="border" variant="white" />
                            </div>
                        ) : (
                            <span>Entrar</span>
                        )}
                    </button>
                    <p>Não possui cadastro? <a href='/cadastro'>Cadastrar</a></p>
                    <a href='/email-senha'>Esqueceu a senha?</a>
                </form>
            </div>
        </div>
    );
}

export default Login;
