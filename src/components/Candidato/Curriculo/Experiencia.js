import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/axiosConfig';
import { Button, Col, Row, Spinner, Container, Card, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";
import UserExperienceModal from '../../Modals/UserExperienceModal';
import Swal from "sweetalert2";
import { showToast, TOAST_TYPES } from '../../ToastNotification';
import { motion, AnimatePresence } from "framer-motion";

const Experiencia = ({ experiencias, setExperiencias }) => {
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [newExperiencia, setNewExperiencia] = useState({
        empresa: '',
        mesInicial: '',
        anoInicial: '',
        mesFinal: '',
        anoFinal: '',
        funcao: '',
        atividades: '',
        trabalhoAtualmente: false
    });

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const mesesOptions = meses.map((mes) => ({
        value: mes,
        label: mes
    }));

    const anos = [];
    for (let i = new Date().getFullYear(); i >= 1975; i--) {
        anos.push(i);
    }

    const anosOptions = anos.map((ano) => ({
        value: ano,
        label: ano.toString()
    }));

    const fetchExperiences = useCallback(async () => {
        try {
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/experiences`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setExperiencias(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao carregar experiências:', error);
        } finally {
            setLoading(false);
        }
    }, [setExperiencias]);

    useEffect(() => {
        fetchExperiences();
    }, [fetchExperiences]);

    const handleAddExperiencia = async () => {
        setLoadingAdd(true);
        try {
            await api.post(`${process.env.REACT_APP_API_URL}/api/user/experiences`, newExperiencia, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast(`Experiência adicionada com sucesso!`, TOAST_TYPES.SUCCESS);
            fetchExperiences();
            setNewExperiencia({
                empresa: '',
                mesInicial: '',
                anoInicial: '',
                mesFinal: '',
                anoFinal: '',
                funcao: '',
                atividades: '',
                trabalhoAtualmente: false
            });
        } catch (error) {
            showToast(`Erro ao adicionar a experiência!`, TOAST_TYPES.ERROR);
        } finally {
            setLoadingAdd(false);
            handleCloseExperienceModal();
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewExperiencia({ ...newExperiencia, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEditChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedExperiencias = experiencias.map((exp, i) => {
            if (i === index) {
                return { ...exp, [name]: type === 'checkbox' ? checked : value || '', edited: true };
            }
            return exp;
        });
        setExperiencias(updatedExperiencias);
    };

    const handleSaveEdit = async (index) => {
        const experiencia = experiencias[index];
        setLoadingAdd(true);
        try {
            await api.put(`${process.env.REACT_APP_API_URL}/api/user/experiences/${experiencia._id}`, experiencia, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast(`Experiência atualizada com sucesso!`, TOAST_TYPES.SUCCESS);
            fetchExperiences();
        } catch (error) {
            showToast(`Erro ao atualizar a experiência!`, TOAST_TYPES.ERROR);
        } finally {
            setLoadingAdd(false);
        }
    };

    const toggleExpand = (index) => {
        const updatedExperiencias = experiencias.map((exp, i) => {
            if (i === index) {
                return { ...exp, expanded: !exp.expanded };
            }
            return exp;
        });
        setExperiencias(updatedExperiencias);
    };

    const handleDeleteExperiencia = async (index) => {
        const experiencia = experiencias[index];
        Swal.fire({
            title: "Tem certeza que deseja deletar a experiência?",
            text: "Esta ação não pode ser desfeita.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim, deletar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoadingDelete(true);
                try {
                    await api.delete(`${process.env.REACT_APP_API_URL}/api/user/experiences/${experiencia._id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    showToast(`Experiência deletada com sucesso!`, TOAST_TYPES.SUCCESS);
                    fetchExperiences();
                } catch (error) {
                    showToast(`Erro ao deletar a experiência!`, TOAST_TYPES.ERROR);
                } finally {
                    setLoadingDelete(false);
                }
            }
        })
    };

    const handleCloseExperienceModal = () => {
        setShowExperienceModal(false);
        setNewExperiencia({
            empresa: '',
            mesInicial: '',
            anoInicial: '',
            mesFinal: '',
            anoFinal: '',
            funcao: '',
            atividades: '',
            trabalhoAtualmente: false
        });
    }

    return (
        <>
            <Container fluid>
                <Row className='d-flex flex-column justify-content-center align-items-center'>
                    {loading ? (
                        <Spinner animation="border" variant="primary" />
                    ) : experiencias.length > 0 ? (
                        experiencias
                            .sort((a, b) => {
                                // Se ambos têm o ano de finalização
                                if (a.anoFinal && b.anoFinal) {
                                    if (a.anoFinal !== b.anoFinal) {
                                        // Ordena pelo ano de forma decrescente
                                        return b.anoFinal - a.anoFinal;
                                    } else {
                                        // Se os anos são iguais, ordena pelo mês (usando o índice do array 'meses')
                                        return meses.indexOf(b.mesFinal) - meses.indexOf(a.mesFinal);
                                    }
                                } else if (a.anoFinal) {
                                    // Se o primeiro item tem anoFinal e o segundo não, o primeiro vem primeiro
                                    return -1;
                                } else if (b.anoFinal) {
                                    // Se o segundo item tem anoFinal e o primeiro não, o segundo vem primeiro
                                    return 1;
                                } else {
                                    // Se nenhum tem anoFinal, mantêm a ordem original
                                    return 0;
                                }
                            })
                            .map((exp, index) => (
                                <Card
                                    key={index}
                                    className="mb-3 border-0 shadow-sm rounded bg-light"
                                >
                                    <Card.Body className="p-2">
                                        <Row onClick={() => toggleExpand(index)}>
                                            <Col xs={11}>
                                                <Card.Title className='mb-0 me-2 info-card'>{exp.empresa}</Card.Title>
                                                <Card.Text>{exp.funcao}</Card.Text>
                                            </Col>
                                            <Col xs={1} className='d-flex align-items-center'>
                                                <span
                                                    style={{ cursor: 'pointer' }}>
                                                    {exp.expanded ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
                                                </span>
                                            </Col>
                                        </Row>
                                        <AnimatePresence>
                                            {exp.expanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                >
                                                    <Form onSubmit={handleAddExperiencia}>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                        >
                                                            <Row className="mb-3 mt-3">
                                                                <Form.Label>Empresa</Form.Label>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        name="empresa"
                                                                        value={exp.empresa || ''}
                                                                        onChange={(e) => handleEditChange(index, e)}
                                                                    />
                                                                </Form.Group>
                                                            </Row>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <Row className="mb-3">
                                                                <Form.Label>Início</Form.Label>
                                                                <Col xs={6}>
                                                                    <Select
                                                                        name="mesInicial"
                                                                        value={mesesOptions.find(option => option.value === exp.mesInicial) || null}
                                                                        onChange={(selectedOption) => handleEditChange(index, { target: { name: 'mesInicial', value: selectedOption ? selectedOption.value : '' } })}
                                                                        options={mesesOptions}
                                                                        placeholder="Mês"
                                                                    />
                                                                </Col>
                                                                <Col xs={6}>
                                                                    <Select
                                                                        name="anoInicial"
                                                                        value={anosOptions.find(option => option.value === exp.anoInicial) || null}
                                                                        onChange={(selectedOption) => handleEditChange(index, { target: { name: 'anoInicial', value: selectedOption ? selectedOption.value : '' } })}
                                                                        options={anosOptions}
                                                                        placeholder="Ano"
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3 }}
                                                        >
                                                            <Row className="mb-2">
                                                                <Form.Label>Fim</Form.Label>
                                                                <Col xs={6}>
                                                                    <Select
                                                                        name="mesFinal"
                                                                        value={mesesOptions.find(option => option.value === exp.mesFinal) || null}
                                                                        onChange={(selectedOption) => handleEditChange(index, { target: { name: 'mesFinal', value: selectedOption ? selectedOption.value : '' } })}
                                                                        options={mesesOptions}
                                                                        placeholder="Mês"
                                                                        isDisabled={exp.trabalhoAtualmente}
                                                                    />
                                                                </Col>
                                                                <Col xs={6}>
                                                                    <Select
                                                                        name="anoFinal"
                                                                        value={anosOptions.find(option => option.value === exp.anoFinal) || null}
                                                                        onChange={(selectedOption) => handleEditChange(index, { target: { name: 'anoFinal', value: selectedOption ? selectedOption.value : '' } })}
                                                                        options={anosOptions}
                                                                        placeholder="Ano"
                                                                        isDisabled={exp.trabalhoAtualmente}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.4 }}
                                                        >
                                                            <Row className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        label="Trabalho atualmente"
                                                                        name="trabalhoAtualmente"
                                                                        checked={exp.trabalhoAtualmente}
                                                                        onChange={(e) => handleEditChange(index, e)}
                                                                    />
                                                                </Form.Group>
                                                            </Row>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.5 }}
                                                        >
                                                            <Row className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Label>Função/Cargo</Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        name="funcao"
                                                                        value={exp.funcao || ''}
                                                                        onChange={(e) => handleEditChange(index, e)}
                                                                    />
                                                                </Form.Group>
                                                            </Row>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.6 }}
                                                        >
                                                            <Row className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Label>Principais atividades</Form.Label>
                                                                    <Form.Control
                                                                        as="textarea"
                                                                        rows={3}
                                                                        name="atividades"
                                                                        value={exp.atividades || ''}
                                                                        onChange={(e) => handleEditChange(index, e)}
                                                                    />
                                                                </Form.Group>
                                                            </Row>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.7 }}
                                                        >
                                                            <Row>
                                                                <Button onClick={() => handleSaveEdit(index)} disabled={!exp.edited}>
                                                                    {loadingAdd ? (
                                                                        <div className="d-flex justify-content-center align-items-center">
                                                                            <Spinner animation="border" variant="white" />
                                                                        </div>
                                                                    ) : (
                                                                        <span>Salvar</span>
                                                                    )}
                                                                </Button>
                                                                <Button variant="danger" onClick={() => handleDeleteExperiencia(index)}>
                                                                    {loadingDelete ? (
                                                                        <div className="d-flex justify-content-center align-items-center">
                                                                            <Spinner animation="border" variant="white" />
                                                                        </div>
                                                                    ) : (
                                                                        <span>Deletar</span>
                                                                    )}
                                                                </Button>
                                                            </Row>
                                                        </motion.div>
                                                    </Form>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card.Body>
                                </Card>
                            ))
                    ) : (
                        <p className='text-center'>Nenhuma experiência informada. Clique em "Adicionar" para cadastrar.</p>
                    )}
                    <Button className="mt-2" onClick={() => setShowExperienceModal(true)}>Adicionar</Button>
                    <UserExperienceModal
                        show={showExperienceModal}
                        onClose={handleCloseExperienceModal}
                        newExperiencia={newExperiencia}
                        handleInputChange={handleInputChange}
                        handleAddExperiencia={handleAddExperiencia}
                        loadingAdd={loadingAdd}
                        mesesOptions={mesesOptions}
                        anosOptions={anosOptions}
                    />
                </Row>
            </Container >
        </>
    );
};

export default Experiencia;