import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/axiosConfig';
import { Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import ReactSelect from 'react-select';

const Formacao = ({ formacoes, setFormacoes }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
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
        'Ensino Fundamental', 'Ensino Médio', 'Técnico', 'Superior'
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

    const graus = [
        'Tecnólogo', 'Graduação', 'Pós-graduação', 'Mestrado', 'Doutorado'
    ];

    const grauOptions = graus.map((grau) => ({
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
            fetchFormacao();
            closePopup();
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
            console.error('Erro ao adicionar formação:', error);
        } finally {
            setLoadingAdd(false);
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
            fetchFormacao();
        } catch (error) {
            console.error('Erro ao atualizar formação:', error);
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
        setLoadingDelete(true);
        try {
            await api.delete(`${process.env.REACT_APP_API_URL}/api/user/formacao/${currentFormacao._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchFormacao();
        } catch (error) {
            console.error('Erro ao remover formação:', error);
        } finally {
            setLoadingDelete(false);
        }
    };

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
                    formacoes.length === 0 ? (
                        <p className='text-center'>Nenhuma formação informada. Clique em "Adicionar" para cadastrar.</p>
                    ) : (
                        formacoes.map((exp, index) => (
                            <div key={index} className={`experience-card ${exp.expanded ? 'expanded' : ''}`}>
                                <div className="card-header" onClick={() => toggleExpand(index)}>
                                    <div className="header-left">
                                        {exp.escolaridade === "Superior" ? (
                                            <>
                                                <h4>{exp.grau} em {exp.curso}</h4>
                                                <p>{exp.instituicao}</p>
                                            </>
                                        ) : exp.escolaridade === "Técnico" ? (
                                            <>
                                                <h4>{exp.escolaridade} em {exp.curso}</h4>
                                                <p>{exp.instituicao}</p>
                                            </>
                                        ) : (
                                            <>
                                                <h4>{exp.escolaridade}</h4>
                                                <p>{exp.instituicao}</p>
                                            </>
                                        )}
                                    </div>
                                    <span className="toggle-icon">
                                        {exp.expanded ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
                                    </span>
                                </div>
                                {exp.expanded && (
                                    <div className={`card-body ${exp.expanded ? 'expanded' : ''}`}>
                                        <div className="form-group">
                                            <label>Instituição</label>
                                            <input type="text" name="instituicao" value={exp.instituicao || ''} onChange={(e) => handleEditChange(index, e)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Escolaridade</label>
                                            <div className="escolaridade-select">
                                                <ReactSelect
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
                                                    styles={customStyles}
                                                    options={escolaridadeOptions}
                                                    placeholder="Selecione"
                                                    isSearchable={false}
                                                />
                                            </div>
                                        </div>
                                        {(exp.escolaridade === 'Técnico' || exp.escolaridade === 'Superior') && (
                                            <div className="form-group">
                                                <label>Curso</label>
                                                <input type="text" name="curso" value={exp.curso || ''} onChange={(e) => handleEditChange(index, e)} />
                                            </div>
                                        )}
                                        {exp.escolaridade === 'Superior' && (
                                            <div className="form-group">
                                                <label>Grau</label>
                                                <div className="grau-select">
                                                    <ReactSelect
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
                                                        styles={customStyles}
                                                        placeholder="Selecione"
                                                        isSearchable={false}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Situação</label>
                                            <div className="situacao-select">
                                                <ReactSelect
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
                                                    styles={customStyles}
                                                    placeholder="Selecione"
                                                    isSearchable={false}
                                                />
                                            </div>
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
                                            <Button className="btn-exp btn-danger mt-2" onClick={() => handleDeleteFormacao(index)}>
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
                        <h3>Adicionar Formação</h3>
                        <div className="form-group">
                            <label>Instituição</label>
                            <input type="text" name="instituicao" value={newFormacao.instituicao} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Escolaridade</label>
                            <div className="escolaridade-select">
                                <ReactSelect
                                    name="escolaridade"
                                    value={escolaridades.map((escolaridade) => ({ value: escolaridade, label: escolaridade })).find(option => option.value === newFormacao.escolaridade) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'escolaridade', value: selectedOption ? selectedOption.value : '' } })}
                                    options={escolaridades.map((escolaridade) => ({ value: escolaridade, label: escolaridade }))}
                                    placeholder="Selecione"
                                    styles={customStyles}
                                    isSearchable={false}
                                />
                            </div>
                        </div>
                        {(newFormacao.escolaridade === 'Técnico' || newFormacao.escolaridade === 'Superior') && (
                            <div className="form-group">
                                <label>Curso</label>
                                <input type="text" name="curso" value={newFormacao.curso} onChange={handleInputChange} />
                            </div>
                        )}
                        {newFormacao.escolaridade === 'Superior' && (
                            <div className="form-group">
                                <label>Grau</label>
                                <div className="grau-select">
                                    <ReactSelect
                                        name="grau"
                                        value={graus.map((grau) => ({ value: grau, label: grau })).find(option => option.value === newFormacao.grau) || null}
                                        onChange={(selectedOption) => handleInputChange({ target: { name: 'grau', value: selectedOption ? selectedOption.value : '' } })}
                                        options={graus.map((grau) => ({ value: grau, label: grau }))}
                                        placeholder="Selecione"
                                        styles={customStyles}
                                        isSearchable={false}
                                    />

                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label>Situação</label>
                            <div className="situacao-select">
                                <ReactSelect
                                    name="situacao"
                                    value={situacoes.map((situacao) => ({ value: situacao, label: situacao })).find(option => option.value === newFormacao.situacao) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'situacao', value: selectedOption ? selectedOption.value : '' } })}
                                    options={situacoes.map((situacao) => ({ value: situacao, label: situacao }))}
                                    placeholder="Selecione"
                                    styles={customStyles}
                                    isSearchable={false}
                                />

                            </div>
                        </div>
                        <div className="form-group">
                            <label>Início</label>
                            <div className="date-select">
                                <ReactSelect
                                    name="mesInicial"
                                    value={mesesOptions.find(option => option.value === newFormacao.mesInicial) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'mesInicial', value: selectedOption ? selectedOption.value : '' } })}
                                    options={mesesOptions}
                                    placeholder="Mês"
                                    styles={customStyles}
                                    isSearchable={false}
                                />
                                <ReactSelect
                                    name="anoInicial"
                                    value={anosOptions.find(option => option.value === newFormacao.anoInicial) || null}
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
                                    value={mesesOptions.find(option => option.value === newFormacao.mesFinal) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'mesFinal', value: selectedOption ? selectedOption.value : '' } })}
                                    options={mesesOptions}
                                    placeholder="Mês"
                                    isSearchable={false}
                                    styles={customStyles}
                                    isDisabled={newFormacao.trabalhoAtualmente} // Desativa o select se estiver trabalhando atualmente
                                />
                                <ReactSelect
                                    name="anoFinal"
                                    value={anosOptions.find(option => option.value === newFormacao.anoFinal) || null}
                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'anoFinal', value: selectedOption ? selectedOption.value : '' } })}
                                    options={anosOptions}
                                    placeholder="Ano"
                                    isSearchable={false}
                                    styles={customStyles}
                                    isDisabled={newFormacao.trabalhoAtualmente} // Desativa o select se estiver trabalhando atualmente
                                />
                            </div>
                        </div>
                        <div className='d-flex flex-column align-items-center'>
                            <Button onClick={handleAddFormacao}>
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

export default Formacao;
