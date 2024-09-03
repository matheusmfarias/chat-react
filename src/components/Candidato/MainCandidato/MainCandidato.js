import React, { useCallback, useState } from "react";
import './MainCandidato.css';
import '../../../styles/global.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


const Main = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = useCallback(async () => {
        const params = new URLSearchParams();

        if (searchTerm) params.append('keyword', searchTerm);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/jobsSearch?${params.toString}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSearchTerm(response.data);
            navigate('/buscar-vagas', { state: {results: response.data }});
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
            notify('Erro ao buscar vagas. Tente novamente mais tarde', 'error');
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
        <main className="main-content-usuario">
            <div className="central-container-usuario">
                <h1>Encontre vagas de emprego</h1>
                <h4>Unimos talento e oportunidade, criando um mundo de possibilidades</h4>
                <Row className="mb-3 align-items-center">
                    <Col xs={12} md={8} className="d-flex justify-content-end">
                        <InputGroup className="shadow rounded" style={{ maxWidth: '500px' }}>
                            <Form.Control
                                type="text"
                                placeholder="Pesquisar por vagas..."
                                aria-label="Pesquisar"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <Button onClick={handleSearch}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
            </div>
        </main >
    );
}

export default Main;