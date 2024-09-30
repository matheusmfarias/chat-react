import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faBars } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/logo-aci-transparente.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from './../../services/axiosConfig';

const Button = React.forwardRef(({ children, onClick, className, isActive }, ref) => (
    <button ref={ref} className={`${className} ${isActive ? 'active' : ''}`} onClick={onClick}>
        {children}
    </button>
));

const HeaderEmpresa = () => {
    const [userName, setUserName] = useState(sessionStorage.getItem('userName') || '');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginActive, setIsLoginActive] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const buttonRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
            return;
        }

        if (!userName) {
            const fetchData = async () => {
                try {
                    const response = await api.get(`${process.env.REACT_APP_API_URL}/api/company/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const fetchedUserName = response.data.nome;
                    setUserName(fetchedUserName);
                    sessionStorage.setItem('userName', fetchedUserName); // Armazena o nome na sessão
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // Redireciona para a página inicial se houver erro ao buscar os dados (token inválido, etc.)
                    navigate('/', { replace: true });
                }
            };
            fetchData();
        }
    }, [userName, navigate]);

    const toggleLoginOptions = useCallback(() => {
        setIsLoginActive(prevState => !prevState);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('userName'); // Remove o nome da sessão ao fazer logout
        navigate('/', { replace: true }); // Redireciona para a página inicial após o logout
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header className="header-candidato">
                <div className="logo-container">
                    <a href="/dashboard-empresa" rel="noreferrer">
                        <img src={logo} alt="Logo" loading="lazy" />
                    </a>
                </div>
                <div className="hamburger-menu" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faBars} />
                </div>
                <nav className={isMenuOpen ? 'active' : ''}>
                    <ul>
                        <Link to="/dashboard-empresa" className={`header-link ${location.pathname === '/dashboard-empresa' ? 'active' : ''}`}><li>Início</li></Link>
                        <Link to="/vagas-empresa" className={`header-link ${location.pathname === '/vagas-empresa' ? 'active' : ''}`}><li>Vagas</li></Link>
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
                            <FontAwesomeIcon icon={isLoginActive ? faAngleUp : faAngleDown} className="seta" />
                        </div>
                    </Button>

                    {isLoginActive && (
                        <div className="opcoes-usuario">
                            <Button className="opcao-usuario" onClick={handleLogout}>Sair</Button>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}

export default HeaderEmpresa;
