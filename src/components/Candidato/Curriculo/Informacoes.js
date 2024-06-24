import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Informacoes.css';

const Informacoes = () => {
    const [informacoes, setInformacoes] = useState({
        cursos: [],
        habilidadesProfissionais: [],
        habilidadesComportamentais: [],
        objetivos: []
    });
    const [inputValues, setInputValues] = useState({
        curso: '',
        habilidadeProfissional: '',
        habilidadeComportamental: '',
        objetivo: ''
    });

    useEffect(() => {
        const fetchInformacoes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/user/informacoes', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setInformacoes(response.data);
            } catch (error) {
                console.error('Erro ao carregar informações:', error);
            }
        };
        fetchInformacoes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputValues({ ...inputValues, [name]: value });
    };

    const handleAddTag = (type) => {
        setInformacoes({
            ...informacoes,
            [type]: [...informacoes[type], inputValues[type.slice(0, -1)]]
        });
        setInputValues({ ...inputValues, [type.slice(0, -1)]: '' });
    };

    const handleRemoveTag = (type, index) => {
        const updatedTags = informacoes[type].filter((_, i) => i !== index);
        setInformacoes({ ...informacoes, [type]: updatedTags });
    };

    const handleSave = async () => {
        try {
            await axios.post('http://localhost:5000/api/user/informacoes', informacoes, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Informações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar informações:', error);
        }
    };

    return (
        <div className="informacoes-container">
            <div className="form-group">
                <label>Cursos/Qualificações</label>
                <div className="tags-input-container">
                    {informacoes.cursos.map((curso, index) => (
                        <div key={index} className="tag">
                            {curso}
                            <span className="tag-close" onClick={() => handleRemoveTag('cursos', index)}>x</span>
                        </div>
                    ))}
                    <input
                        type="text"
                        name="curso"
                        value={inputValues.curso}
                        onChange={handleInputChange}
                        placeholder="Adicionar curso/qualificação"
                    />
                    <button type="button" onClick={() => handleAddTag('cursos')}>Adicionar</button>
                </div>
            </div>
            <div className="form-group">
                <label>Habilidades Profissionais</label>
                <div className="tags-input-container">
                    {informacoes.habilidadesProfissionais.map((habilidade, index) => (
                        <div key={index} className="tag">
                            {habilidade}
                            <span className="tag-close" onClick={() => handleRemoveTag('habilidadesProfissionais', index)}>x</span>
                        </div>
                    ))}
                    <input
                        type="text"
                        name="habilidadeProfissional"
                        value={inputValues.habilidadeProfissional}
                        onChange={handleInputChange}
                        placeholder="Adicionar habilidade profissional"
                    />
                    <button type="button" onClick={() => handleAddTag('habilidadesProfissionais')}>Adicionar</button>
                </div>
            </div>
            <div className="form-group">
                <label>Habilidades Comportamentais</label>
                <div className="tags-input-container">
                    {informacoes.habilidadesComportamentais.map((habilidade, index) => (
                        <div key={index} className="tag">
                            {habilidade}
                            <span className="tag-close" onClick={() => handleRemoveTag('habilidadesComportamentais', index)}>x</span>
                        </div>
                    ))}
                    <input
                        type="text"
                        name="habilidadeComportamental"
                        value={inputValues.habilidadeComportamental}
                        onChange={handleInputChange}
                        placeholder="Adicionar habilidade comportamental"
                    />
                    <button type="button" onClick={() => handleAddTag('habilidadesComportamentais')}>Adicionar</button>
                </div>
            </div>
            <div className="form-group">
                <label>Objetivos</label>
                <div className="tags-input-container">
                    {informacoes.objetivos.map((objetivo, index) => (
                        <div key={index} className="tag">
                            {objetivo}
                            <span className="tag-close" onClick={() => handleRemoveTag('objetivos', index)}>x</span>
                        </div>
                    ))}
                    <input
                        type="text"
                        name="objetivo"
                        value={inputValues.objetivo}
                        onChange={handleInputChange}
                        placeholder="Adicionar objetivo"
                    />
                    <button type="button" onClick={() => handleAddTag('objetivos')}>Adicionar</button>
                </div>
            </div>
            <button type="button" onClick={handleSave}>Salvar Informações</button>
        </div>
    );
};

export default Informacoes;
