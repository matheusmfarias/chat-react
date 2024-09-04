import React, { useCallback, useState } from "react";
import './MainCandidato.css';
import '../../../styles/global.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Main = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterParam, setFilterParam] = useState(''); // Novo estado para o filtro
    const navigate = useNavigate();

    const handleSearch = useCallback(async () => {
        // Verifica se pelo menos um dos campos está preenchido
        if (!searchTerm.trim() && !filterParam.trim()) {
            notify('Por favor, insira um termo de pesquisa ou filtro', 'error');
            return;
        }

        const params = new URLSearchParams();

        // Adiciona o cargo (searchTerm) se estiver preenchido
        if (searchTerm.trim()) {
            params.append('keyword', searchTerm); // Busca pelo cargo
        }

        // Adiciona os filtros (cidade, estado, tipo ou modelo) se estiver preenchido
        if (filterParam.trim()) {
            params.append('filter', filterParam); // Busca por cidade, estado, tipo ou modelo
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/jobsSearch?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/buscar-vagas', { state: { results: response.data } });
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
            notify('Erro ao buscar vagas. Tente novamente mais tarde', 'error');
        }
    }, [searchTerm, filterParam, navigate]);

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
        <main className="d-flex justify-content-center align-items-center text-center vh-50 bg-cover bg-center" style={{ backgroundImage: `url(${require('../../../assets/images/fundo.png')})` }}>
            <div className="text-white">
                <h1>Encontre vagas de emprego</h1>
                <h4 style={{ fontWeight: '300' }}>Unimos talento e oportunidade, criando um mundo de possibilidades</h4>
                <Row className="d-flex flex-row align-items-center justify-content-center mt-4">
                    <Col xs={10} md={10}>
                        <InputGroup className="shadow">
                            {/* FormControl para o campo de pesquisa */}
                            <Form.Control
                                type="text"
                                placeholder="Pesquisar por cargos..."
                                aria-label="Pesquisar"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="rounded-start border-primary"
                            />
                            {/* FormControl para o filtro */}
                            <Form.Control
                                type="text"
                                placeholder="Cidade, estado, tipo ou modelo"
                                aria-label="Filtro"
                                value={filterParam}
                                onChange={e => setFilterParam(e.target.value)}
                                className="rounded-0 border-primary"
                            />
                            {/* Botão com largura reduzida */}
                            <Button variant="light" onClick={handleSearch} className="btn-outline-primary rounded-end w-auto px-5">
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
