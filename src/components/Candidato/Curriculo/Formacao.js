import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Formacao = ({ formacoes, setFormacoes }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [newFormacao, setNewFormacao] = useState({
        escolaridade: '',
        instituicao: '',
        situacao: '',
        curso: '',
        grau: ''
    });

    const escolaridades = [
        'Ensino Fundamental', 'Ensino Médio', 'Técnico', 'Superior'
    ];

    const situacoes = [
        'Completo', 'Incompleto', 'Cursando', 'Trancado'
    ];

    const graus = [
        'Tecnólogo', 'Graduação', 'Pós-graduação', 'Mestrado', 'Doutorado'
    ];

    const fetchFormacao = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/user/formacao', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFormacoes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao carregar formações:', error);
        }
    };

    useEffect(() => {
        fetchFormacao();
    }, []);

    const handleAddFormacao = async () => {
        try {
            await axios.post('http://localhost:5000/api/user/formacao', newFormacao, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchFormacao();
            closePopup();
            setNewFormacao({
                escolaridade: '',
                instituicao: '',
                situacao: '',
                curso: '',
                grau: ''
            });
        } catch (error) {
            console.error('Erro ao adicionar formação:', error);
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
        try {
            await axios.put(`http://localhost:5000/api/user/formacao/${currentFormacao._id}`, currentFormacao, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchFormacao();
        } catch (error) {
            console.error('Erro ao atualizar formação:', error);
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
        try {
            await axios.delete(`http://localhost:5000/api/user/formacao/${currentFormacao._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchFormacao();
        } catch (error) {
            console.error('Erro ao remover formação:', error);
        }
    };

    return (
        <>
            <div className='form-columns-container'>
                {formacoes.length === 0 ? (
                    <p>Nenhuma formação informada. Clique em "Adicionar" para cadastrar.</p>
                ) : (
                    formacoes.map((exp, index) => (
                        <div key={index} className={`experience-card ${exp.expanded ? 'expanded' : ''}`}>
                            <div className="card-header" onClick={() => toggleExpand(index)}>
                                <div className="header-left">
                                    <h4>{exp.escolaridade}</h4>
                                    <p>{exp.instituicao}</p>
                                </div>
                                <span className="toggle-icon">{exp.expanded ? '▲' : '▼'}</span>
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
                                            <select name="escolaridade" value={exp.escolaridade || ''} onChange={(e) => handleEditChange(index, e)}>
                                                <option value="">Selecione</option>
                                                {escolaridades.map((escolaridade, i) => (
                                                    <option key={i} value={escolaridade}>{escolaridade}</option>
                                                ))}
                                            </select>
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
                                                <select name="grau" value={exp.grau || ''} onChange={(e) => handleEditChange(index, e)}>
                                                    <option value="">Selecione</option>
                                                    {graus.map((grau, i) => (
                                                        <option key={i} value={grau}>{grau}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Situação</label>
                                        <div className="situacao-select">
                                            <select name="situacao" value={exp.situacao || ''} onChange={(e) => handleEditChange(index, e)}>
                                                <option value="">Selecione</option>
                                                {situacoes.map((situacao, i) => (
                                                    <option key={i} value={situacao}>{situacao}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="button-group">
                                        <button type="button" className="save-btn" onClick={() => handleSaveEdit(index)} disabled={!exp.edited}>Salvar</button>
                                        <button type="button" className="delete-btn" onClick={() => handleDeleteFormacao(index)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <button type="button" className="add-experience-btn" onClick={() => setShowPopup(true)}>Adicionar</button>
            </div>
            {showPopup && (
                <div className={`popup-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`popup-content ${isClosing ? 'closing' : ''}`}>
                        <h3>Adicionar Formação</h3>
                        <div>
                            <div className="form-group">
                                <label>Instituição</label>
                                <input type="text" name="instituicao" value={newFormacao.instituicao} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Escolaridade</label>
                                <div className="escolaridade-select">
                                    <select name="escolaridade" value={newFormacao.escolaridade} onChange={handleInputChange}>
                                        <option value="">Selecione</option>
                                        {escolaridades.map((escolaridade, index) => (
                                            <option key={index} value={escolaridade}>{escolaridade}</option>
                                        ))}
                                    </select>
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
                                        <select name="grau" value={newFormacao.grau} onChange={handleInputChange}>
                                            <option value="">Selecione</option>
                                            {graus.map((grau, index) => (
                                                <option key={index} value={grau}>{grau}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Situação</label>
                                <div className="situacao-select">
                                    <select name="situacao" value={newFormacao.situacao} onChange={handleInputChange} >
                                        <option value="">Selecione</option>
                                        {situacoes.map((situacao, index) => (
                                            <option key={index} value={situacao}>{situacao}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="button-group">
                                <button type="button" onClick={handleAddFormacao}>Adicionar</button>
                                <button type="button" onClick={closePopup}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Formacao;
