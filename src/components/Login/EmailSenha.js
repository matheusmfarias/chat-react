import React, { useState } from "react";
import api from '../../services/axiosConfig';
import logo from '../../assets/images/logo-aci-transparente.png';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import InputVerificado from "../Inputs/InputVerificado";

const EmailSenha = () => {
    const [email, setEmail] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await api.post(`${process.env.REACT_APP_API_URL}/api/auth/verifica-email`, { email });
            console.log(email);
            localStorage.setItem('emailRecuperacao', email); // Armazena o email novo para verificação
            navigate('/confirma-email', { state: { email } });
        } catch (error) {
            if (error.response) {
                setErro(error.response.data);
            } else {
                setErro('Erro durante a solicitação. Por favor, tente novamente mais tarde.')
            }
        }
    };

    return (
        <div className="container-login">
            <div className="form-login">
                <div className='logo-container-login'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <h2>Esqueceu a senha?</h2>
                <p className="text-center">Para redefinir a sua senha, primeiramente insira seu e-mail.</p>
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
                    {erro && <div className='text-danger m-0'>{erro}</div>}
                    <button type="submit" className="btn btn-primary btn-entrar">
                        Solicitar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EmailSenha;
