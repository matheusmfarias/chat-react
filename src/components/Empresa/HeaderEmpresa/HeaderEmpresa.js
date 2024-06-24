import React, { useState, useCallback, useEffect } from 'react';
import './HeaderEmpresa.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/images/logo-aci-transparente.png';
import '../../../styles/global.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Button = ({ children, onClick, className, isActive }) => (
    <button className={`${className} ${isActive ? 'active' : ''}`} onClick={onClick}>
        {children}
    </button>
);

function HeaderEmpresa() {
    const [isMenuActive, setIsMenuActive] = useState(false);
    const [empresa, setEmpresa] = useState('');

    const toggleMenuOptions = useCallback(() => {
        setIsMenuActive(prevState => !prevState);
    }, []);

    useEffect(() => {
        const fetchEmpresa = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/company', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setEmpresa(response.data.nome);
            } catch (error) {
                console.error('Erro ao buscar dados da empresa:', error);
            }
        };

        fetchEmpresa();
    }, []);

    return (
        <>
            <header className="header">
                <div className='logo-container'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <div className="auth-area">
                    <span className="empresa-nome">{empresa}</span>
                    <nav className="menu">
                        <Link to='/dashboard-empresa' className='link'>
                            <Button className='menu-option'>Início</Button>
                        </Link>
                        <Link to='/curriculos' className='link'>
                            <Button className='menu-option'>Currículos</Button>
                        </Link>
                        <Link to='/vagas' className='link'>
                            <Button className='menu-option'>Vagas</Button>
                        </Link>
                    </nav>
                    <Button
                        className="login-button"
                        onClick={toggleMenuOptions}
                        isActive={isMenuActive}
                        aria-expanded={isMenuActive}
                    >
                        <span>Opções</span>
                        <div className={`setas-container ${isMenuActive ? 'up' : 'down'}`}>
                            <FontAwesomeIcon icon={isMenuActive ? faAngleUp : faAngleDown} className='seta' />
                        </div>
                    </Button>

                    {isMenuActive && (
                        <div className='opcoes-login'>
                            <Link to='/logout' className='link'>
                                <Button className='opcao-login'>Sair</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}

export default HeaderEmpresa;
