import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/axiosConfig';
import { Button, Card, Container, Col, Row, Spinner, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import UserFormationModal from '../../Modals/UserFormationModal';
import Swal from "sweetalert2";
import { showToast, TOAST_TYPES } from '../../ToastNotification';

const Formacao = ({ formacoes, setFormacoes }) => {
    const [showFormationModal, setShowFormationModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [newFormacao, setNewFormacao] = useState({
        escolaridade: '',
        instituicao: '',
        situacao: '',
        curso: '',
        grau: ''
    });

    const anos = [];
    for (let i = new Date().getFullYear(); i >= 1975; i--) {
        anos.push(i);
    }

    const anosOptions = anos.map((ano) => ({
        value: ano,
        label: ano.toString()  // Transformando o número em string para exibir no select
    }));

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const mesesOptions = meses.map((mes) => ({
        value: mes,
        label: mes
    }));

    const escolaridades = [
        'Ensino Fundamental', 'Ensino Médio', 'Técnico', 'Graduação', 'Pós-graduação'
    ];

    const escolaridadeOptions = escolaridades.map((escolaridade) => ({
        value: escolaridade,
        label: escolaridade
    }));

    const situacoes = [
        'Completo', 'Incompleto', 'Cursando', 'Trancado'
    ];

    const situacaoOptions = situacoes.map((situacao) => ({
        value: situacao,
        label: situacao
    }));

    const grausGraduacao = [
        'Tecnólogo', 'Bacharelado', 'Licenciatura'
    ];

    const grauOptions = grausGraduacao.map((grau) => ({
        value: grau,
        label: grau
    }));

    const grausPosGraduacao = [
        'Especialização', 'Mestrado', 'Doutorado', 'Pós-doutorado'
    ];

    const grauPosOptions = grausPosGraduacao.map((grau) => ({
        value: grau,
        label: grau
    }));

    const fetchFormacao = useCallback(async () => {
        try {
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/formacao`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFormacoes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao carregar formações:', error);
        } finally {
            setLoading(false);
        }
    }, [setFormacoes]);

    useEffect(() => {
        fetchFormacao();
    }, [fetchFormacao]);

    const handleAddFormacao = async () => {
        setLoadingAdd(true);
        try {
            await api.post(`${process.env.REACT_APP_API_URL}/api/user/formacao`, newFormacao, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast(`Formação adicionada com sucesso!`, TOAST_TYPES.SUCCESS);
            fetchFormacao();
            setNewFormacao({
                escolaridade: '',
                instituicao: '',
                situacao: '',
                curso: '',
                grau: '',
                mesInicial: '',
                anoInicial: '',
                mesFinal: '',
                anoFinal: ''
            });
        } catch (error) {
            showToast(`Erro ao adicionar a formação!`, TOAST_TYPES.ERROR);
        } finally {
            setLoadingAdd(false);
            handleCloseFormationModal();
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewFormacao({ ...newFormacao, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEditChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedFormacao = formacoes.map((exp, i) => {
            if (i === index) {
                return { ...exp, [name]: type === 'checkbox' ? checked : value || '', edited: true };
            }
            return exp;
        });
        setFormacoes(updatedFormacao);
    };

    const handleSaveEdit = async (index) => {
        const currentFormacao = formacoes[index];
        setLoadingAdd(true);
        try {
            await api.put(`${process.env.REACT_APP_API_URL}/api/user/formacao/${currentFormacao._id}`, currentFormacao, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast(`Formação atualizada com sucesso!`, TOAST_TYPES.SUCCESS);
            fetchFormacao();
        } catch (error) {
            showToast(`Erro ao atualizar a formação!`, TOAST_TYPES.ERROR);
        } finally {
            setLoadingAdd(false);
        }
    };

    const toggleExpand = (index) => {
        const updatedFormacao = formacoes.map((exp, i) => {
            if (i === index) {
                return { ...exp, expanded: !exp.expanded };
            }
            return exp;
        });
        setFormacoes(updatedFormacao);
    };

    const handleDeleteFormacao = async (index) => {
        const currentFormacao = formacoes[index];
        Swal.fire({
            title: "Tem certeza que deseja deletar a formação?",
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
                    await api.delete(`${process.env.REACT_APP_API_URL}/api/user/formacao/${currentFormacao._id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    showToast(`Formação deletada com sucesso!`, TOAST_TYPES.SUCCESS);
                    fetchFormacao();
                } catch (error) {
                    showToast(`Erro ao deletar a formação!`, TOAST_TYPES.ERROR);
                } finally {
                    setLoadingDelete(false);
                }
            }
        })
    };

    const handleCloseFormationModal = () => {
        setShowFormationModal(false);
        setNewFormacao({
            escolaridade: '',
            instituicao: '',
            situacao: '',
            curso: '',
            grau: '',
            mesInicial: '',
            anoInicial: '',
            mesFinal: '',
            anoFinal: ''
        });
    }

    return (
        <>
            <Container fluid>
                <Row className='d-flex flex-column justify-content-center align-items-center'>
                    {loading ? (
                        <Spinner animation="border" variant="primary" />
                    ) : formacoes.length > 0 ? (
                        formacoes
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
                                                {exp.escolaridade === "Graduação" || exp.escolaridade === "Pós-graduação" ? (
                                                    <>
                                                        <Card.Title className='mb-0 me-2 info-card'>{exp.grau} em {exp.curso}</Card.Title>
                                                        <Card.Text>{exp.instituicao}</Card.Text>
                                                    </>
                                                ) : exp.escolaridade === "Técnico" ? (
                                                    <>
                                                        <Card.Title className='mb-0 me-2 info-card'>{exp.escolaridade} em {exp.curso}</Card.Title>
                                                        <Card.Text>{exp.instituicao}</Card.Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Card.Title className='mb-0 me-2 info-card'>{exp.escolaridade}</Card.Title>
                                                        <Card.Text>{exp.instituicao}</Card.Text>
                                                    </>
                                                )}
                                            </Col>
                                            <Col xs={1} className='d-flex align-items-center'>
                                                <span style={{ cursor: 'pointer' }}>
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
                                                    <Form onSubmit={handleAddFormacao}>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                        >
                                                            <Row className="mb-3 mt-3">
                                                                <Form.Label>Instituição</Form.Label>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        name="instituicao"
                                                                        value={exp.instituicao || ''}
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
                                                                <Form.Label>Escolaridade</Form.Label>
                                                                <Select
                                                                    name="escolaridade"
                                                                    value={escolaridadeOptions.find(option => option.value === exp.escolaridade) || null}
                                                                    onChange={(selectedOption) =>
                                                                        handleEditChange(index, {
                                                                            target: {
                                                                                name: 'escolaridade',
                                                                                value: selectedOption ? selectedOption.value : ''
                                                                            }
                                                                        })
                                                                    }
                                                                    options={escolaridadeOptions}
                                                                    placeholder="Selecione"
                                                                />
                                                            </Row>
                                                        </motion.div>
                                                        {(exp.escolaridade === 'Técnico' || exp.escolaridade === 'Graduação' || exp.escolaridade === 'Pós-graduação') && (
                                                            <Row className="mb-3">
                                                                <Form.Label>Curso</Form.Label>
                                                                <Form.Group>
                                                                    <Form.Control
                                                                        type="text"
                                                                        name="curso"
                                                                        value={exp.curso || ''}
                                                                        onChange={(e) => handleEditChange(index, e)}
                                                                    />
                                                                </Form.Group>
                                                            </Row>
                                                        )}
                                                        {exp.escolaridade === 'Graduação' && (
                                                            <Row className="mb-3">
                                                                <Form.Label>Grau</Form.Label>
                                                                <Form.Group>
                                                                    <Select
                                                                        name="grau"
                                                                        value={grauOptions.find(option => option.value === exp.grau) || null}
                                                                        onChange={(selectedOption) =>
                                                                            handleEditChange(index, {
                                                                                target: {
                                                                                    name: 'grau',
                                                                                    value: selectedOption ? selectedOption.value : ''
                                                                                }
                                                                            })
                                                                        }
                                                                        options={grauOptions}
                                                                        placeholder="Selecione"
                                                                    />
                                                                </Form.Group>
                                                            </Row>
                                                        )}
                                                        {exp.escolaridade === 'Pós-graduação' && (
                                                            <Row className="mb-3">
                                                                <Form.Label>Grau</Form.Label>
                                                                <Form.Group>
                                                                    <Select
                                                                        name="grau"
                                                                        value={grauPosOptions.find(option => option.value === exp.grau) || null}
                                                                        onChange={(selectedOption) =>
                                                                            handleEditChange(index, {
                                                                                target: {
                                                                                    name: 'grau',
                                                                                    value: selectedOption ? selectedOption.value : ''
                                                                                }
                                                                            })
                                                                        }
                                                                        options={grauPosOptions}
                                                                        placeholder="Selecione"
                                                                    />
                                                                </Form.Group>
                                                            </Row>
                                                        )}
                                                        <Row className="mb-3">
                                                            <Form.Label>Situação</Form.Label>
                                                            <Select
                                                                name="situacao"
                                                                value={situacaoOptions.find(option => option.value === exp.situacao) || null}
                                                                onChange={(selectedOption) =>
                                                                    handleEditChange(index, {
                                                                        target: {
                                                                            name: 'situacao',
                                                                            value: selectedOption ? selectedOption.value : ''
                                                                        }
                                                                    })
                                                                }
                                                                options={situacaoOptions}
                                                                placeholder="Selecione"
                                                            />
                                                        </Row>
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
                                                        {(exp.situacao === 'Completo') && (
                                                            <Row className="mb-3">
                                                                <Form.Label>Fim</Form.Label>
                                                                <Col xs={6}>
                                                                    <Select
                                                                        name="mesFinal"
                                                                        value={mesesOptions.find(option => option.value === exp.mesFinal) || null}
                                                                        onChange={(selectedOption) => handleEditChange(index, { target: { name: 'mesFinal', value: selectedOption ? selectedOption.value : '' } })}
                                                                        options={mesesOptions}
                                                                        placeholder="Mês"
                                                                    />
                                                                </Col>
                                                                <Col xs={6}>
                                                                    <Select
                                                                        name="anoFinal"
                                                                        value={anosOptions.find(option => option.value === exp.anoFinal) || null}
                                                                        onChange={(selectedOption) => handleEditChange(index, { target: { name: 'anoFinal', value: selectedOption ? selectedOption.value : '' } })}
                                                                        options={anosOptions}
                                                                        placeholder="Ano"
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        )}
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
                                                                <Button variant="danger" onClick={() => handleDeleteFormacao(index)}>
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
                        <p className='text-center'>Nenhuma formação informada. Clique em "Adicionar" para cadastrar.</p>
                    )}
                    <Button className="mt-2" onClick={() => setShowFormationModal(true)}>Adicionar</Button>
                    <UserFormationModal
                        show={showFormationModal}
                        onClose={handleCloseFormationModal}
                        newFormacao={newFormacao}
                        handleInputChange={handleInputChange}
                        handleAddFormacao={handleAddFormacao}
                        loadingAdd={loadingAdd}
                        mesesOptions={mesesOptions}
                        anosOptions={anosOptions}
                        grauOptions={grauOptions}
                        grausPosOptions={grausPosGraduacao}
                        grausGraduacao={grausGraduacao}
                        situacaoOptions={situacoes}
                        escolaridadeOptions={escolaridades}
                    />
                </Row>
            </Container>
        </>
    );
};
export default Formacao;
