import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import './HeaderCandidato.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/images/logo-aci-transparente.png';
import '../../../styles/global.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoadingContext } from "../../../context/LoadingContext";

const Button = React.forwardRef(({ children, onClick, className, isActive }, ref) => (
    <button ref={ref} className={`${className} ${isActive ? 'active' : ''}`} onClick={onClick}>
        {children}
    </button>
));

const HeaderCandidato = () => {
    const { showLoading, hideLoading } = useContext(LoadingContext);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const buttonRef = useRef(null);

    useEffect(() => {
        showLoading();
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
                }).finally(() => {
                    hideLoading();
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
