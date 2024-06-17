import React, { useState, useEffect, useContext } from 'react';
import "./Cadastro.css";
import axios from 'axios';
import SenhaInput from "../SenhaInput/SenhaInput";
import useFormattedCPF, { validarCPF } from '../../hooks/useFormattedCPF';
import useFormattedNome from '../../hooks/useFormattedNome';
import logo from '../../assets/images/logo-aci-transparente.png';
import { useNavigate } from 'react-router-dom';
import InputVerificado from './InputVerificado';
import { ErrorContext, ErrorProvider } from '../../context/ErrorContext';

const Cadastro = ({ onRegister }) => {
    const [nome, handleNomeChange] = useFormattedNome('');
    const [sobrenome, handleSobrenomeChange] = useFormattedNome('');
    const [userData, setUserData] = useState({
        cpf: '',
        nascimento: '',
        email: '',
        senha: '',
        confirmacaoSenha: ''
    });
    const [cpf, handleSetCpf] = useFormattedCPF(userData.cpf);
    const { errors, setErrors } = useContext(ErrorContext);
    const [dataMinima, setDataMinima] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const dataAtual = new Date();
        const anoMinimo = dataAtual.getFullYear() - 14;
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        setDataMinima(`${anoMinimo}-${mes}-${dia}`);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpf') {
            handleSetCpf(value);
        } else {
            setUserData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const validarSenha = (senha) => {
        const requisitos = [
            /.{8,}/,
            /\d/,
            /[a-z]/,
            /[^A-Za-z0-9]/,
            /[A-Z]/
        ];
        return requisitos.every(requisito => requisito.test(senha));
    };

    const validarNascimento = (nascimento) => {
        const dataNascimento = new Date(nascimento);
        const dataMin = new Date(dataMinima);
        return dataNascimento <= dataMin;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let formErrors = {};
        if (!validarCPF(cpf)) {
            formErrors.cpf = 'CPF inválido! Verifique suas informações.';
        }
        if (!validarNascimento(userData.nascimento)) {
            formErrors.nascimento = 'A data de nascimento indica idade inferior a 14 anos.';
        }
        if (!validarSenha(userData.senha)) {
            formErrors.senha = 'A senha não cumpre os requisitos exigidos.';
        } else if (userData.senha !== userData.confirmacaoSenha) {
            formErrors.confirmacaoSenha = 'As senhas informadas não correspondem.';
        }
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/auth/register', { nome, sobrenome, ...userData, cpf });
            onRegister();
            navigate('/verificacao-token', { state: { email: userData.email } });
        } catch (error) {
            console.error('Erro no cadastro:', error);
            setErrors({ cadastro: 'E-mail e/ou CPF já cadastrados, verifique suas informações!' });
        }
    };

    return (
        <div className="container-cadastro" role="form">
            <div className="form-cadastro">
                <div className='logo-container-cadastro'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <h2>Crie sua conta</h2>
                <form onSubmit={handleSubmit} className='credencial-cadastro'>
                    <InputVerificado
                        type="text"
                        label="Nome"
                        id="nome"
                        name="nome"
                        maxLength="20"
                        value={nome}
                        onChange={handleNomeChange}
                        title="Seu nome"
                        required
                    />
                    <InputVerificado
                        type="text"
                        label="Sobrenome"
                        id="sobrenome"
                        name="sobrenome"
                        maxLength="100"
                        value={sobrenome}
                        onChange={handleSobrenomeChange}
                        title="Seu sobrenome"
                        required
                    />
                    <InputVerificado
                        type="text"
                        label="CPF"
                        id="cpf"
                        name="cpf"
                        maxLength="14"
                        value={cpf}
                        onChange={handleChange}
                        title="Seu CPF"
                        shouldValidate={true}
                        required
                    />
                    <InputVerificado
                        type="date"
                        label="Data de nascimento"
                        id="nascimento"
                        name="nascimento"
                        min="1924-01-01"
                        max={dataMinima}
                        title="Sua data de nascimento"
                        value={userData.nascimento}
                        onChange={handleChange}
                        required
                    />
                    <InputVerificado
                        type="email"
                        label="E-mail"
                        id="email"
                        name="email"
                        maxLength="55"
                        value={userData.email}
                        onChange={handleChange}
                        title="Seu e-mail"
                        shouldValidate={true}
                        required
                    />
                    <SenhaInput
                        label="Senha"
                        name="senha"
                        placeholder="Crie uma senha"
                        title="Sua senha"
                        value={userData.senha}
                        onChange={handleChange}
                        showRequirements={true}
                        required
                    />
                    <SenhaInput
                        label="Confirmação da senha"
                        name="confirmacaoSenha"
                        placeholder="Confirme sua senha"
                        title="Confirme sua senha"
                        value={userData.confirmacaoSenha}
                        onChange={handleChange}
                        showRequirements={false}
                        required
                    />
                    {errors.cpf && <div className="text-danger">{errors.cpf}</div>}
                    {errors.nascimento && <div className="text-danger">{errors.nascimento}</div>}
                    {errors.confirmacaoSenha && <div className="text-danger">{errors.confirmacaoSenha}</div>}
                    {errors.senha && <div className="text-danger">{errors.senha}</div>}
                    {errors.cadastro && <div className='text-danger'>{errors.cadastro}</div>}
                    <p>
                        Ao se inscrever com o e-mail, você concorda com nossos <a href="termos.html" target="_blank">termos</a> e com a nossa <a href="politica-privacidade.html" target="_blank">política de privacidade ACI</a>.
                    </p>
                    <button type="submit" className="btn btn-primary">
                        Cadastrar
                    </button>
                    <p>Possui cadastro? <a href='/login'>Entrar</a></p>
                </form>
            </div>
        </div>
    );
}

export default function CadastroWithContext(props) {
    return (
        <ErrorProvider>
            <Cadastro {...props} />
        </ErrorProvider>
    );
}
