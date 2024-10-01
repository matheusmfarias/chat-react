import React, { useState, useCallback, useEffect, useRef } from 'react';
import './HeaderCandidato.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/images/logo-aci-transparente.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/axiosConfig';

const Button = React.forwardRef(({ children, onClick, className, isActive }, ref) => (
    <button ref={ref} className={`${className} ${isActive ? 'active' : ''}`} onClick={onClick}>
        {children}
    </button>
));

const HeaderCandidato = () => {
    const [userName, setUserName] = useState(sessionStorage.getItem('userName') || '');
    const navigate = useNavigate();
    const location = useLocation();
    const buttonRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Detecta se é mobile

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
            return; // Impede que a execução continue
        }

        if (!userName) {
            api.get(`${process.env.REACT_APP_API_URL}/api/user/candidato`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    const fetchedUserName = response.data.nome;
                    setUserName(fetchedUserName);
                    sessionStorage.setItem('userName', fetchedUserName); // Armazena o nome na sessão
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                    // Se o token for inválido ou a chamada falhar, redireciona para a página inicial
                    navigate('/', { replace: true });
                });
        }
    }, [userName, navigate]);

    const [isLoginActive, setIsLoginActive] = useState(false);

    const toggleLoginOptions = useCallback(() => {
        setIsLoginActive(prevState => !prevState);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('userName'); // Remove o nome da sessão ao fazer logout
        navigate('/', { replace: true }); // Redireciona para a página inicial após o logout
    };

    return (
        <>
            <header className="header-candidato">
                <div className="logo-container">
                    <a href="/dashboard" rel="noreferrer">
                        <img src={logo} alt="Logo" loading="lazy" />
                    </a>
                </div>
                {!isMobile && ( // Exibe o menu apenas no modo desktop
                    <nav className="desktop-menu">
                        <ul>
                            <Link to="/buscar-vagas" className={`header-link ${location.pathname === '/buscar-vagas' ? 'active' : ''}`}><li>Oportunidades</li></Link>
                            <Link to="/inscricoes-candidato" className={`header-link ${location.pathname === '/inscricoes-candidato' ? 'active' : ''}`}><li>Inscrições</li></Link>
                            <Link to="/curriculo" className={`header-link ${location.pathname === '/curriculo' ? 'active' : ''}`}><li>Currículo</li></Link>
                        </ul>
                    </nav>
                )}
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
                        <div className="opcoes-usuario">
                            <Link to="/config-candidato" className="link">
                                <Button className="opcao-usuario">Perfil</Button>
                            </Link>
                            {isMobile && ( // Exibe os links no dropdown apenas no modo mobile
                                <>
                                    <Link to="/buscar-vagas" className={`link ${location.pathname === '/buscar-vagas' ? 'active' : ''}`}>
                                        <Button className="opcao-usuario">Oportunidades</Button>
                                    </Link>
                                    <Link to="/inscricoes-candidato" className={`link ${location.pathname === '/inscricoes-candidato' ? 'active' : ''}`}>
                                        <Button className="opcao-usuario">Inscrições</Button>
                                    </Link>
                                    <Link to="/curriculo" className={`link ${location.pathname === '/curriculo' ? 'active' : ''}`}>
                                        <Button className="opcao-usuario">Currículo</Button>
                                    </Link>
                                </>
                            )}
                            <Button className="opcao-usuario" onClick={handleLogout}>Sair</Button>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};

export default HeaderCandidato;
