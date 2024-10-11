// Import the necessary functions and hooks
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/axiosConfig';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import ReactSelect from 'react-select';

const Experiencia = ({ experiencias, setExperiencias }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
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
            fetchExperiences();
            closePopup();
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
            console.error('Erro ao adicionar experiência:', error);
        } finally {
            setLoadingAdd(false);
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
            fetchExperiences();
        } catch (error) {
            console.error('Erro ao atualizar experiência:', error);
        } finally {
            setLoadingAdd(false);
        }
    };

    const closePopup = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setShowPopup(false);
        }, 500);
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
        setLoadingDelete(true);
        try {
            await api.delete(`${process.env.REACT_APP_API_URL}/api/user/experiences/${experiencia._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchExperiences();
        } catch (error) {
            console.error('Erro ao remover experiência:', error);
        } finally {
            setLoadingDelete(false);
        }
    };

    // Convertendo os anos para o formato aceito pelo ReactSelect
    const anosOptions = anos.map((ano) => ({
        value: ano,
        label: ano.toString()  // Transformando o número em string para exibir no select
    }));

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            width: '100%',
            padding: '0 15px',               // Adiciona padding horizontal
            border: '2px solid #D3D3D3',
            borderRadius: '8px',
            fontSize: '16px',
            height: '58px',               // Define a altura mínima para 58px
            display: 'flex',
            alignItems: 'center',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(31, 82, 145, 0.25)' : 'none',
            '&:hover': {
                borderColor: '#1F5291',
            }
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '54px',
            padding: '0',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#1F5291' : 'white',
            color: state.isSelected ? 'white' : '#575e67',
            padding: '15px',
            fontSize: '16px',
            '&:hover': {
                backgroundColor: '#286abb',
                color: 'white',
            }
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '8px',
            marginTop: '5px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#1F5291',
            '&:hover': {
                color: '#286abb',
            }
        }),
        indicatorSeparator: () => ({
            display: 'none',
        })
    };


    return (
        <>
            <div className='form-columns-container'>
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : (
                    experiencias.length === 0 ? (
                        <p className='text-center'>Nenhuma experiência informada. Clique em "Adicionar" para cadastrar.</p>
                    ) : (
                        experiencias.map((exp, index) => (
                            <div key={index} className={`experience-card ${exp.expanded ? 'expanded' : ''}`}>
                                <Row className="card-header" onClick={() => toggleExpand(index)}>
                                    <Col md={11} xs={10}>
                                        <h4>{exp.empresa}</h4>
                                        <p>{exp.funcao}</p>
                                    </Col>
                                    <Col md={1} xs={2}>
                                        <span className="toggle-icon">
                                            {exp.expanded ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
                                        </span>
                                    </Col>
                                </Row>
                                {exp.expanded && (
                                    <div className={`card-body ${exp.expanded ? 'expanded' : ''}`}>
                                        <div className="form-group">
                                            <label>Empresa</label>
                                            <input type="text" name="empresa" value={exp.empresa || ''} onChange={(e) => handleEditChange(index, e)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Início</label>
                                            <div className="date-select">
                                                <ReactSelect
                                                    name="mesInicial"
                                                    value={mesesOptions.find(option => option.value === exp.mesInicial) || ''}
                                                    onChange={(selectedOption) => handleEditChange(index, { target: { name: 'mesInicial', value: selectedOption ? selectedOption.value : '' } })}
                                                    options={mesesOptions}
                                                    placeholder="Mês"
                                                    styles={customStyles}
                                                    isSearchable={false}
                                                />
                                                <ReactSelect
                                                    name="anoInicial"
                                                    value={anosOptions.find(option => option.value === exp.anoInicial) || ''}
                                                    onChange={(selectedOption) => handleEditChange(index, { target: { name: 'anoInicial', value: selectedOption ? selectedOption.value : '' } })}
                                                    options={anosOptions}
                                                    placeholder="Ano"
                                                    styles={customStyles}
                                                    isSearchable={false}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Fim</label>
                                            <div className="date-select">
                                                <ReactSelect
                                                    name="mesFinal"
                                                    value={mesesOptions.find(option => option.value === exp.mesFinal) || ''}
                                                    onChange={(selectedOption) => handleEditChange(index, { target: { name: 'mesFinal', value: selectedOption ? selectedOption.value : '' } })}
                                                    options={mesesOptions}
                                                    placeholder="Mês"
                                                    styles={customStyles}
                                                    isSearchable={false}
                                                    isDisabled={exp.trabalhoAtualmente}
                                                />
                                                <ReactSelect
                                                    name="anoFinal"
                                                    value={anosOptions.find(option => option.value === exp.anoFinal) || ''}
                                                    onChange={(selectedOption) => handleEditChange(index, { target: { name: 'anoFinal', value: selectedOption ? selectedOption.value : '' } })}
                                                    options={anosOptions}
                                                    placeholder="Ano"
                                                    styles={customStyles}
                                                    isSearchable={false}
                                                    isDisabled={exp.trabalhoAtualmente}
                                                />
                                            </div>
                                            <label className='text-dark'>
                                                <input type="checkbox" name="trabalhoAtualmente" checked={exp.trabalhoAtualmente} onChange={(e) => handleEditChange(index, e)} />
                                                Trabalho Atualmente
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label>Função/Cargo</label>
                                            <input type="text" name="funcao" value={exp.funcao || ''} onChange={(e) => handleEditChange(index, e)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Principais atividades</label>
                                            <textarea name="atividades" value={exp.atividades || ''} onChange={(e) => handleEditChange(index, e)}></textarea>
                                        </div>
                                        <div className='d-flex flex-column align-items-center mb-2'>
                                            <Button className="btn-exp btn-primary mt-2" onClick={() => handleSaveEdit(index)} disabled={!exp.edited}>
                                                {loadingAdd ? (
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        <Spinner animation="border" variant="white" />
                                                    </div>
                                                ) : (
                                                    <span>Salvar</span>
                                                )}
                                            </Button>
                                            <Button className="btn-exp btn-danger mt-2" onClick={() => handleDeleteExperiencia(index)}>
                                                {loadingDelete ? (
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        <Spinner animation="border" variant="white" />
                                                    </div>
                                                ) : (
                                                    <span>Deletar</span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ))}
                <Button className="btn-adicionar-curriculo mt-4" onClick={() => setShowPopup(true)}>Adicionar</Button>
            </div>
            {showPopup && (
                <div className={`popup-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`popup-content ${isClosing ? 'closing' : ''}`}>
                        <h3>Adicionar Experiência</h3>
                        <div className="form-group">
                            <label>Empresa</label>
                            <input type="text" name="empresa" value={newExperiencia.empresa} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Início</label>
                            <div className="date-select">
                                <ReactSelect
                                    name="mesInicial"
                                    value={mesesOptions.find(option => option.value === newExperiencia.mesInicial) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'mesInicial', value: selectedOption ? selectedOption.value : '' } })}
                                    options={mesesOptions}
                                    placeholder="Mês"
                                    styles={customStyles}
                                    isSearchable={false}
                                />
                                <ReactSelect
                                    name="anoInicial"
                                    value={anosOptions.find(option => option.value === newExperiencia.anoInicial) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'anoInicial', value: selectedOption ? selectedOption.value : '' } })}
                                    options={anosOptions}
                                    placeholder="Ano"
                                    styles={customStyles}
                                    isSearchable={false}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Fim</label>
                            <div className="date-select">
                                <ReactSelect
                                    name="mesFinal"
                                    value={mesesOptions.find(option => option.value === newExperiencia.mesFinal) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'mesFinal', value: selectedOption ? selectedOption.value : '' } })}
                                    options={mesesOptions}
                                    placeholder="Mês"
                                    isSearchable={false}
                                    styles={customStyles}
                                    isDisabled={newExperiencia.trabalhoAtualmente} // Desativa o select se estiver trabalhando atualmente
                                />
                                <ReactSelect
                                    name="anoFinal"
                                    value={anosOptions.find(option => option.value === newExperiencia.anoFinal) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'anoFinal', value: selectedOption ? selectedOption.value : '' } })}
                                    options={anosOptions}
                                    placeholder="Ano"
                                    isSearchable={false}
                                    styles={customStyles}
                                    isDisabled={newExperiencia.trabalhoAtualmente} // Desativa o select se estiver trabalhando atualmente
                                />
                            </div>
                            <label className='text-dark'>
                                <input type="checkbox" name="trabalhoAtualmente" checked={newExperiencia.trabalhoAtualmente} onChange={handleInputChange} />
                                Trabalho Atualmente
                            </label>
                        </div>
                        <div className="form-group">
                            <label>Função/Cargo</label>
                            <input type="text" name="funcao" value={newExperiencia.funcao} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Principais atividades</label>
                            <textarea name="atividades" value={newExperiencia.atividades} onChange={handleInputChange}></textarea>
                        </div>
                        <div className='d-flex flex-column align-items-center'>
                            <Button onClick={handleAddExperiencia}>
                                {loadingAdd ? (
                                    <div className="d-flex justify-content-center align-items-center">
                                        <Spinner animation="border" variant="white" />
                                    </div>
                                ) : (
                                    <span>Adicionar</span>
                                )}
                            </Button>
                            <Button variant='secondary' onClick={closePopup}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Experiencia;
