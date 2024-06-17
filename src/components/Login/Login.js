import React, { useState } from "react";
import axios from 'axios';
import logo from '../../assets/images/logo-aci-transparente.png';
import SenhaInput from "../SenhaInput/SenhaInput";
import './Login.css';
import { useNavigate } from 'react-router-dom';
import InputVerificado from "../Cadastro/InputVerificado";

const Login = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erroLogin, setErroLogin] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, senha });

            const { token } = response.data;

            // Armazena o token no localStorage
            localStorage.setItem('token', token);

            navigate('/dashboard');
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
                {/*
                <Link to='/' className='btn-voltar'>
                    <button className="btn btn-primary">Voltar</button>
                </Link>
                */}
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
                    <p>Não possui cadastro? <a href='/cadastro'>Cadastrar</a></p>
                </form>
            </div>
        </div>
    );
}

export default Login;
