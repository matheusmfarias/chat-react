import React, { useEffect, useState } from "react";
import api from '../../services/axiosConfig';
import logo from '../../assets/images/logo-aci-transparente.png';
import SenhaInput from "../SenhaInput/SenhaInput";
import './Login.css';
import { useNavigate } from 'react-router-dom';
import InputVerificado from "../Inputs/InputVerificado";

const LoginEmpresa = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erroLogin, setErroLogin] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "ACI Empregos | Login";
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`${process.env.REACT_APP_API_URL}/api/auth/login-empresa`, { email, senha });

            const { token, role } = response.data;

            // Armazena o token no localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (role === 'empresa') {
                navigate('/dashboard-empresa');
            } else {
                setErroLogin('Credenciais inválidas.');
            }
        } catch (error) {
            if (error.response) {
                setErroLogin(error.response.data);
            } else {
                setErroLogin('Erro ao fazer login. Por favor, tente novamente mais tarde.');
            }
        }
    };

    return (
        <div className="container-login">
            <div className="form-login">
                <div className='logo-container-login'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
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
                        Entrar
                    </button>
                    <p>Não possui cadastro? <a href='https://web.whatsapp.com/send?phone=5555992128613' target="_blank" rel="noreferrer">Solicitar</a></p>
                </form>
            </div>
        </div>
    );
}

export default LoginEmpresa;
