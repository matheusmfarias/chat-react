import React, { useState, useCallback } from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/images/logo-aci-transparente.png';
import { Link } from 'react-router-dom';

const Button = React.memo(({ children, onClick, className, isActive, ariaControls }) => (
    <button
        className={`${className} ${isActive ? 'active' : ''}`}
        onClick={onClick}
        aria-expanded={isActive}
        aria-controls={ariaControls}
    >
        {children}
    </button>
));

function Header() {
    const [isLoginActive, setIsLoginActive] = useState(false);

    const toggleLoginOptions = useCallback(() => {
        setIsLoginActive(prevState => !prevState);
    }, []);

    return (
        <header className="header">
            <div className='logo-container'>
                <Link to="/" aria-label="Página inicial">
                    <img src={logo} alt="Logo da Empresa" loading="lazy" />
                </Link>
            </div>
            <div className="auth-area">
                <Button
                    className="login-button"
                    onClick={toggleLoginOptions}
                    isActive={isLoginActive}
                    ariaControls="opcoes-login"
                >
                    <span>Entrar</span>
                    <div className={`setas-container ${isLoginActive ? 'up' : 'down'}`}>
                        <FontAwesomeIcon icon={isLoginActive ? faAngleUp : faAngleDown} className='seta' />
                    </div>
                </Button>

                {isLoginActive && (
                    <div id="opcoes-login" className="opcoes-login" aria-live="polite">
                        <Link to='/login' className='link'>
                            <Button className='opcao-login'>Candidato</Button>
                        </Link>
                        <Link to='/login-empresa' className='link'>
                            <Button className='opcao-login'>Empresa</Button>
                        </Link>
                    </div>
                )}

                <Link to='/cadastro' className='link'>
                    <Button className="cadastro-button">
                        <span>Cadastro</span>
                    </Button>
                </Link>
            </div>
        </header>
    );
}

export default Header;
