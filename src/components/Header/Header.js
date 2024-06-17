import React, { useState, useCallback } from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/logo-aci-transparente.png';
import '../../styles/global.css';
import { Link } from 'react-router-dom';

const Button = ({ children, onClick, className, isActive }) => (
    <button className={`${className} ${isActive ? 'active' : ''}`} onClick={onClick}>
        {children}
    </button>
);

function Header() {
    const [isLoginActive, setIsLoginActive] = useState(false);

    const toggleLoginOptions = useCallback(() => {
        setIsLoginActive(prevState => !prevState);
    }, []);

    return (
        <>
            <header className="header">
                <div className='logo-container'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <div className="auth-area">
                    <Button
                        className="login-button"
                        onClick={toggleLoginOptions}
                        isActive={isLoginActive}
                        aria-expanded={isLoginActive}
                    >
                        <span>Login</span>
                        <div className={`setas-container ${isLoginActive ? 'up' : 'down'}`}>
                            <FontAwesomeIcon icon={isLoginActive ? faAngleUp : faAngleDown} className='seta' />
                        </div>
                    </Button>

                    {isLoginActive && (
                        <div className='opcoes-login'>
                            <Link to='/login' className='link'>
                                <Button className='opcao-login'>Candidato</Button>
                            </Link>
                            <Button className='opcao-login'>Empresa</Button>
                        </div>
                    )}
                    <Link to='/cadastro' className='link'>
                        <Button className="cadastro-button">
                            <span>Cadastro</span>
                        </Button>
                    </Link>
                </div>
            </header>
        </>
    );
}

export default Header;
