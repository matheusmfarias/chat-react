import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../services/axiosConfig';
import { Button, Spinner } from 'react-bootstrap';
import './Informacoes.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const Informacoes = () => {
    const [loading, setLoading] = useState(true);
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
                const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/informacoes`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setInformacoes(response.data);
            } catch (error) {
                console.error('Erro ao carregar informações:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInformacoes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputValues({ ...inputValues, [name]: value });
    };

    const fieldMap = useMemo(() => ({
        cursos: 'curso',
        habilidadesProfissionais: 'habilidadeProfissional',
        habilidadesComportamentais: 'habilidadeComportamental',
        objetivos: 'objetivo'
    }), []);

    const handleAddTag = useCallback(async (type, value) => {
        try {
            const item = { [fieldMap[type]]: value };
            await api.post(`${process.env.REACT_APP_API_URL}/api/user/${type}`, item, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setInformacoes((prevInformacoes) => ({
                ...prevInformacoes,
                [type]: [...prevInformacoes[type], value]
            }));
            setInputValues((prevValues) => ({ ...prevValues, [fieldMap[type]]: '' }));
        } catch (error) {
            console.error(`Erro ao adicionar ${fieldMap[type]}:`, error);
        }
    }, [fieldMap]);

    const handleRemoveTag = useCallback(async (type, value) => {
        try {
            const item = { [fieldMap[type]]: value };
            await api.delete(`${process.env.REACT_APP_API_URL}/api/user/${type}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                data: item
            });

            setInformacoes((prevInformacoes) => ({
                ...prevInformacoes,
                [type]: prevInformacoes[type].filter((tag) => tag !== value)
            }));
        } catch (error) {
            console.error(`Erro ao remover ${fieldMap[type]}:`, error);
        }
    }, [fieldMap]);

    return (
        <div className="informacoes-container">
            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <>
                    <InformacaoCard
                        title="Cursos e qualificações"
                        inputName="curso"
                        inputValue={inputValues.curso}
                        handleInputChange={handleInputChange}
                        tags={informacoes.cursos}
                        placeholder="Adicionar curso/qualificação"
                        handleAddTag={() => handleAddTag('cursos', inputValues.curso)}
                        handleRemoveTag={(value) => handleRemoveTag('cursos', value)}
                    />
                    <InformacaoCard
                        title="Habilidades profissionais"
                        inputName="habilidadeProfissional"
                        inputValue={inputValues.habilidadeProfissional}
                        handleInputChange={handleInputChange}
                        tags={informacoes.habilidadesProfissionais}
                        placeholder="Adicionar habilidade profissional"
                        handleAddTag={() => handleAddTag('habilidadesProfissionais', inputValues.habilidadeProfissional)}
                        handleRemoveTag={(value) => handleRemoveTag('habilidadesProfissionais', value)}
                    />
                    <InformacaoCard
                        title="Habilidades comportamentais"
                        inputName="habilidadeComportamental"
                        inputValue={inputValues.habilidadeComportamental}
                        handleInputChange={handleInputChange}
                        tags={informacoes.habilidadesComportamentais}
                        placeholder="Adicionar habilidade comportamental"
                        handleAddTag={() => handleAddTag('habilidadesComportamentais', inputValues.habilidadeComportamental)}
                        handleRemoveTag={(value) => handleRemoveTag('habilidadesComportamentais', value)}
                    />
                    <InformacaoCard
                        title="Objetivos"
                        inputName="objetivo"
                        inputValue={inputValues.objetivo}
                        handleInputChange={handleInputChange}
                        tags={informacoes.objetivos}
                        placeholder="Adicionar objetivo"
                        handleAddTag={() => handleAddTag('objetivos', inputValues.objetivo)}
                        handleRemoveTag={(value) => handleRemoveTag('objetivos', value)}
                    />
                </>
            )}
        </div>
    );
};

const InformacaoCard = ({ title, inputName, inputValue, handleInputChange, tags, handleAddTag, handleRemoveTag, placeholder }) => (
    <div className='informacoes-card'>
        <h4>{title}</h4>
        <input
            type="text"
            name={inputName}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
        />
        <div className='tags-container'>
            {tags.map((tag, index) => (
                <div key={index} className="tag">
                    <span className='txt-tag'>{tag}</span>
                    <FontAwesomeIcon icon={faTimesCircle} className="tag-close" onClick={() => handleRemoveTag(tag)} />
                </div>
            ))}
        </div>
        <Button className="btn-adicionar-curriculo mt-4" onClick={handleAddTag} disabled={!inputValue}>Adicionar</Button>
    </div>
);

export default Informacoes;