import React, { useState, useCallback, useEffect, useRef } from 'react';
import './HeaderCandidato.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/images/logo-aci-transparente.png';
import '../../../styles/global.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Button = React.forwardRef(({ children, onClick, className, isActive }, ref) => (
    <button ref={ref} className={`${className} ${isActive ? 'active' : ''}`} onClick={onClick}>
        {children}
    </button>
));

const HeaderCandidato = () => {
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const buttonRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5000/api/user/candidato', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setUserName(response.data.nome); // Assumindo que o nome do usuário está no campo 'nome'
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        } else {
            console.error('No token found');
        }
    }, []);

    const [isLoginActive, setIsLoginActive] = useState(false);

    const toggleLoginOptions = useCallback(() => {
        setIsLoginActive(prevState => !prevState);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    return (
        <>
            <header className="header-candidato">
                <div className='logo-container'>
                    <a href='/dashboard' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <nav>
                    <ul>
                        <Link to="/dashboard" className={`header-link ${location.pathname === '/dashboard' ? 'active' : ''}`}><li>Início</li></Link>
                        <Link to="/inscricoes" className={`header-link ${location.pathname === '/inscricoes' ? 'active' : ''}`}><li>Inscrições</li></Link>
                        <Link to="/curriculo" className={`header-link ${location.pathname === '/curriculo' ? 'active' : ''}`}><li>Currículo</li></Link>
                    </ul>
                </nav>
                <div className="opcoes-area">
                    <Button
                        ref={buttonRef}
                        className="usuario-btn"
                        onClick={toggleLoginOptions}
                        isActive={isLoginActive}
                        aria-expanded={isLoginActive}
                    >
                        <span>{userName}</span>
                        <div className={`setas-container ${isLoginActive ? 'up' : 'down'}`}>
                            <FontAwesomeIcon icon={isLoginActive ? faAngleUp : faAngleDown} className='seta' />
                        </div>
                    </Button>

                    {isLoginActive && (
                        <div className='opcoes-usuario'>
                            <Link to='/config-candidato' className='link'>
                                <Button className='opcao-usuario'>Perfil</Button>
                            </Link>
                            <Button className='opcao-usuario' onClick={handleLogout}>Sair</Button>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}

export default HeaderCandidato;
