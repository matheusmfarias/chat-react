import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/logo-aci-transparente.png';
import '../../styles/global.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Button = React.forwardRef(({ children, onClick, className, isActive }, ref) => (
    <button ref={ref} className={`${className} ${isActive ? 'active' : ''}`} onClick={onClick}>
        {children}
    </button>
));

const HeaderEmpresa = () => {
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const buttonRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:5000/api/company/me', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUserName(response.data.nome);
                } else {
                    console.error('No token found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
            }
        };
        fetchData();
    }, []);

    const [isLoginActive, setIsLoginActive] = useState(false);

    const toggleLoginOptions = useCallback(() => {
        setIsLoginActive(prevState => !prevState);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    return (
        <>
            <header className="header-candidato">
                <div className='logo-container'>
                    <a href='/dashboard-empresa' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <nav>
                    <ul>
                        <Link to="/dashboard-empresa" className={`header-link ${location.pathname === '/dashboard-empresa' ? 'active' : ''}`}><li>Início</li></Link>
                        <Link to="/curriculos" className={`header-link ${location.pathname === '/curriculos-empresa' ? 'active' : ''}`}><li>Currículos</li></Link>
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
                            <FontAwesomeIcon icon={isLoginActive ? faAngleUp : faAngleDown} className='seta' />
                        </div>
                    </Button>

                    {isLoginActive && (
                        <div className='opcoes-usuario'>
                            <Link to='/config-empresa' className='link'>
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

export default HeaderEmpresa;
