import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/images/logo-aci-transparente.png';
import SenhaInput from "../SenhaInput/SenhaInput";

const RecuperaSenha = () => {
    const [tokenValido, setTokenValido] = useState(false);  // Estado para verificar se o token é válido
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState(''); // Inicialmente uma string
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Extrair o token da URL
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    useEffect(() => {
        // Valida o token quando o componente é montado
        const validaToken = async () => {
            try {
                const response = await api.post(`${process.env.REACT_APP_API_URL}/api/auth/valida-token-recuperacao`, { token });
                if (response.status === 200) {
                    setTokenValido(true);  // O token é válido
                    console.log('Token válido');
                }
            } catch (error) {
                console.error('Erro ao validar token:', error);
                setErro('Token inválido ou expirado. Redirecionando para a página inicial...');
                setTimeout(() => {
                    navigate('/');  // Redireciona para a página inicial após 3 segundos
                }, 3000);
            }
        };

        if (token) {
            validaToken();
        } else {
            setErro('Token não fornecido. Redirecionando para a página inicial...');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
    }, [token, navigate]);

    const validarSenha = (senha) => {
        const requisitos = [
            /.{8,}/,       // Pelo menos 8 caracteres
            /\d/,          // Pelo menos um número
            /[a-z]/,       // Pelo menos uma letra minúscula
            /[^A-Za-z0-9]/,// Pelo menos um caractere especial
            /[A-Z]/        // Pelo menos uma letra maiúscula
        ];
        return requisitos.every(requisito => requisito.test(senha));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let formErrors = {}; // Inicializa o objeto de erros

        if (!validarSenha(senha)) {
            formErrors.senha = 'A senha não cumpre os requisitos exigidos.';
        } else if (senha !== confirmarSenha) {
            formErrors.confirmarSenha = 'As senhas informadas não correspondem.';
        }

        if (Object.keys(formErrors).length > 0) {
            setErro(formErrors); // Armazena o objeto de erros
            return;
        }

        try {
            await api.post(`${process.env.REACT_APP_API_URL}/api/auth/redefinir-senha`, { token, novaSenha: senha });
            setShowSuccessPopup(true);
            setTimeout(() => {
                navigate('/login');
            }, 5000); // Redirecionar após 5 segundos
        } catch (error) {
            console.error('Erro ao redefinir a senha:', error);
            setErro({ geral: 'Erro ao redefinir a senha. Tente novamente.' }); // Armazena erro geral
        }
    };

    return (
        <div className="container-login">
            <div className="form-login">
                <div className='logo-container-login'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <h2>Redefinir Senha</h2>

                {/* Verifica se o erro é uma string (erro geral) */}
                {typeof erro === 'string'}

                {tokenValido ? (
                    <form onSubmit={handleSubmit} className="credencial-login">
                        <SenhaInput
                            label="Senha"
                            name="senha"
                            placeholder="Crie uma senha"
                            title="Sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            showRequirements={true}
                            required
                        />
                        <SenhaInput
                            label="Confirmação da senha"
                            name="confirmacaoSenha"
                            placeholder="Confirme sua senha"
                            title="Confirme sua senha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            showRequirements={false}
                            required
                        />

                        {/* Exibe mensagens de erro específicas */}
                        {erro.senha && <div className="text-danger">{erro.senha}</div>}
                        {erro.confirmarSenha && <div className="text-danger">{erro.confirmarSenha}</div>}

                        <button type="submit" className="btn btn-primary mt-4">Alterar Senha</button>
                    </form>
                ) : (
                    <div>Validando token...</div>
                )}
            </div>
            {showSuccessPopup && (
                <>
                    <div className="overlay"></div>
                    <div className="success-popup">
                        <p>Sua senha foi atualizada com sucesso! Você será redirecionado para o login.</p>
                        <p>Caso não seja redirecionado, clique <a href='/login'>aqui</a>.</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecuperaSenha;
