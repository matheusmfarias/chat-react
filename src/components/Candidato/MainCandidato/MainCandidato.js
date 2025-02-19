import React, { useCallback, useEffect, useState } from "react";
import './MainCandidato.css';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { showToast, TOAST_TYPES } from '../../ToastNotification';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { faClockRotateLeft, faMagnifyingGlass, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const Main = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const navigate = useNavigate();
    const userId = Cookies.get('userId');
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = require('../../../assets/images/fundo.webp');
        img.onload = () => setImageLoaded(true);
    }, []);

    const loadRecentSearches = useCallback(() => {
        const searches = Cookies.get(`searches_${userId}`); // Busca o cookie associado ao usuário
        return searches ? JSON.parse(searches) : [];
    }, [userId]); // Dependência é apenas userId    

    const updateRecentSearches = (newSearch) => {
        const existingSearches = loadRecentSearches();
        const updatedSearches = [newSearch, ...existingSearches.filter(item => item !== newSearch)].slice(0, 5);
        Cookies.set(`searches_${userId}`, JSON.stringify(updatedSearches), { expires: 7 }); // Expira em 7 dias
        setRecentSearches(updatedSearches);
    };

    useEffect(() => {
        document.title = "ACI Empregos | Promovendo Desenvolvimento";
        setRecentSearches(loadRecentSearches());
    }, [loadRecentSearches]);

    const handleSearch = useCallback(async (term) => {
        const params = new URLSearchParams();

        // Adiciona o cargo (searchTerm) se estiver preenchido
        if (term.trim()) {
            params.append('keyword', term); // Busca pelo cargo
        }
        // Redireciona para a tela de buscar vagas com os parâmetros da barra de pesquisa
        try {
            navigate(`/buscar-vagas?keyword=${encodeURIComponent(term)}`);
        } catch (error) {
            showToast('Erro ao redirecionar para busca de vagas', TOAST_TYPES.ERROR);
        }
    }, [navigate]);

    const performSearch = (term = searchTerm) => {
        if (term.trim() !== '') {
            updateRecentSearches(term);
            handleSearch(term);
        } else {
            showToast('Por favor, insira um termo de pesquisa', TOAST_TYPES.ERROR);
            return;
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    return (
        <main
            className="d-flex justify-content-center align-items-center text-center vh-50 bg-cover bg-center"
            style={{
                backgroundImage: imageLoaded ? `url(${require('../../../assets/images/fundo.webp')})` : 'none',
                backgroundColor: imageLoaded ? 'transparent' : '#6987A8'
            }}
        >
            <Col xs={12} md={10} className="text-white p-1">
                <h1>Encontre vagas de emprego</h1>
                <span className="fs-5 fw-light">Unimos talento e oportunidade, criando um mundo de possibilidades</span>
                <Row className="justify-content-center">
                    <Col xs={12} md={10} xl={8} xxl={7} className="mt-2">
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                performSearch();
                            }}
                        >
                            <InputGroup className="p-1">
                                <Form.Control
                                    type="text"
                                    placeholder="Pesquisar por oportunidades, cidade, modelo..."
                                    aria-label="Pesquisar"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="rounded-start border-primary"
                                />
                                {searchTerm && (
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="icon-remove-tag position-absolute"
                                        onClick={() => handleClearSearch()}
                                        style={{
                                            right: '80px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                )}
                                <Button
                                    type="submit"
                                    variant="light"
                                    className="btn-outline-primary rounded-end w-auto px-4"
                                >
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </Button>
                            </InputGroup>
                        </form>
                        <Row className="mt-2 m-1">
                            {recentSearches.length > 0 && recentSearches.map((search, index) => (
                                <div
                                    className="filter-tag m-1 text-primary bg-white"
                                    style={{ cursor: 'pointer', width: 'auto', maxWidth: '30%' }}
                                    key={index}
                                    onClick={() => {
                                        setSearchTerm(search);
                                        performSearch(search);
                                    }}
                                >
                                    <span
                                        className="me-2 info-card">{search}</span>
                                    <FontAwesomeIcon icon={faClockRotateLeft} />
                                </div>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </Col >
        </main >
    );
}

export default Main;
