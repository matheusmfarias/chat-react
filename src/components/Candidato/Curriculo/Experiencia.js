import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Experiencia = () => {
    const [experiencias, setExperiencias] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
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

    const anos = [];
    for (let i = new Date().getFullYear(); i >= 1975; i--) {
        anos.push(i);
    }

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/user/experiences', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setExperiencias(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Erro ao carregar experiências:', error);
            }
        };
        fetchExperiences();
    }, []);

    const handleAddExperiencia = async () => {
        try {
            await axios.post('http://localhost:5000/api/user/experiences', newExperiencia, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const response = await axios.get('http://localhost:5000/api/user/experiences', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setExperiencias(Array.isArray(response.data) ? response.data : []);
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
        try {
            await axios.put(`http://localhost:5000/api/user/experiences/${experiencia._id}`, experiencia, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const response = await axios.get(`http://localhost:5000/api/user/experiences/${experiencia._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const updatedExperiencias = experiencias.map((exp, i) => (i === index ? response.data : exp));
            setExperiencias(updatedExperiencias);
        } catch (error) {
            console.error('Erro ao atualizar experiência:', error);
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
        try {
            await axios.delete(`http://localhost:5000/api/user/experiences/${experiencia._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const response = await axios.get('http://localhost:5000/api/user/experiences', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setExperiencias(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao remover experiência:', error);
        }
    };

    return (
        <>
            <div className='form-columns-container'>
                {experiencias.length === 0 ? (
                    <p>Nenhuma experiência informada. Clique em "Adicionar" para cadastrar.</p>
                ) : (
                    experiencias.map((exp, index) => (
                        <div key={index} className={`experience-card ${exp.expanded ? 'expanded' : ''}`}>
                            <div className="card-header" onClick={() => toggleExpand(index)}>
                                <div className="header-left">
                                    <h4>{exp.empresa}</h4>
                                    <p>{exp.funcao}</p>
                                </div>
                                <span className="toggle-icon">{exp.expanded ? '▲' : '▼'}</span>
                            </div>
                            {exp.expanded && (
                                <div className={`card-body ${exp.expanded ? 'expanded' : ''}`}>
                                    <div className="form-group">
                                        <label>Empresa</label>
                                        <input type="text" name="empresa" value={exp.empresa || ''} onChange={(e) => handleEditChange(index, e)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Início</label>
                                        <div className="date-select">
                                            <select name="mesInicial" value={exp.mesInicial || ''} onChange={(e) => handleEditChange(index, e)}>
                                                <option value="">Mês</option>
                                                {meses.map((mes, i) => (
                                                    <option key={i} value={mes}>{mes}</option>
                                                ))}
                                            </select>
                                            <select name="anoInicial" value={exp.anoInicial || ''} onChange={(e) => handleEditChange(index, e)}>
                                                <option value="">Ano</option>
                                                {anos.map((ano, i) => (
                                                    <option key={i} value={ano}>{ano}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Fim</label>
                                        <div className="date-select">
                                            <select name="mesFinal" value={exp.mesFinal || ''} onChange={(e) => handleEditChange(index, e)} disabled={exp.trabalhoAtualmente}>
                                                <option value="">Mês</option>
                                                {meses.map((mes, i) => (
                                                    <option key={i} value={mes}>{mes}</option>
                                                ))}
                                            </select>
                                            <select name="anoFinal" value={exp.anoFinal || ''} onChange={(e) => handleEditChange(index, e)} disabled={exp.trabalhoAtualmente}>
                                                <option value="">Ano</option>
                                                {anos.map((ano, i) => (
                                                    <option key={i} value={ano}>{ano}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <label>
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
                                    <div className="button-group">
                                        <button type="button" className="save-btn" onClick={() => handleSaveEdit(index)} disabled={!exp.edited}>Salvar</button>
                                        <button type="button" className="delete-btn" onClick={() => handleDeleteExperiencia(index)}>
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
                        <h3>Adicionar Experiência</h3>
                        <div>
                            <div className="form-group">
                                <label>Empresa</label>
                                <input type="text" name="empresa" value={newExperiencia.empresa} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Início</label>
                                <div className="date-select">
                                    <select name="mesInicial" value={newExperiencia.mesInicial} onChange={handleInputChange}>
                                        <option value="">Mês</option>
                                        {meses.map((mes, index) => (
                                            <option key={index} value={mes}>{mes}</option>
                                        ))}
                                    </select>
                                    <select name="anoInicial" value={newExperiencia.anoInicial} onChange={handleInputChange}>
                                        <option value="">Ano</option>
                                        {anos.map((ano, index) => (
                                            <option key={index} value={ano}>{ano}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Fim</label>
                                <div className="date-select">
                                    <select name="mesFinal" value={newExperiencia.mesFinal} onChange={handleInputChange} disabled={newExperiencia.trabalhoAtualmente}>
                                        <option value="">Mês</option>
                                        {meses.map((mes, index) => (
                                            <option key={index} value={mes}>{mes}</option>
                                        ))}
                                    </select>
                                    <select name="anoFinal" value={newExperiencia.anoFinal} onChange={handleInputChange} disabled={newExperiencia.trabalhoAtualmente}>
                                        <option value="">Ano</option>
                                        {anos.map((ano, index) => (
                                            <option key={index} value={ano}>{ano}</option>
                                        ))}
                                    </select>
                                </div>
                                <label>
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
                            <div className="button-group">
                                <button type="button" onClick={handleAddExperiencia}>Adicionar</button>
                                <button type="button" onClick={closePopup}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Experiencia;
