import React, { useCallback, useEffect, useState } from "react";
import './MainCandidato.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Main = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "ACI Empregos | Promovendo Desenvolvimento";
      }, []);

    const handleSearch = useCallback(async () => {
        if (!searchTerm.trim()) {
            notify('Por favor, insira um termo de pesquisa', 'error');
            return;
        }

        const params = new URLSearchParams();

        // Adiciona o cargo (searchTerm) se estiver preenchido
        if (searchTerm.trim()) {
            params.append('keyword', searchTerm); // Busca pelo cargo
        }
        // Redireciona para a tela de buscar vagas com os parâmetros da barra de pesquisa
        try {
            navigate('/buscar-vagas', { state: { keyword: searchTerm } });
        } catch (error) {
            console.error('Erro ao redirecionar para busca de vagas:', error);
            notify('Erro ao redirecionar para busca de vagas', 'error');
        }
    }, [searchTerm, navigate]);

    const notify = (message, type) => {
        toast[type](message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            closeButton: false
        });
    };

    return (
        <main className="d-flex justify-content-center align-items-center text-center vh-50 bg-cover bg-center" style={{ backgroundImage: `url(${require('../../../assets/images/fundo.webp')})` }}>
            <div className="text-white">
                <h1>Encontre vagas de emprego</h1>
                <h4 style={{ fontWeight: '300' }}>Unimos talento e oportunidade, criando um mundo de possibilidades</h4>
                <Row className="d-flex flex-row align-items-center justify-content-center mt-4">
                    <Col xs={11} md={10}>
                        <InputGroup className="shadow">
                            {/* Campo de pesquisa de cargos */}
                            <Form.Control
                                type="text"
                                placeholder="Pesquisar por oportunidades..."
                                aria-label="Pesquisar"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="rounded-start border-primary"
                            />
                            {/* Botão de busca */}
                            <Button variant="light" onClick={handleSearch} className="btn-outline-primary rounded-end w-auto px-4">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
            </div>
            <ToastContainer />
        </main>
    );
}

export default Main;
