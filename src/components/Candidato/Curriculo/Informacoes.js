import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../services/axiosConfig';
import { Button, Spinner } from 'react-bootstrap';
import './Informacoes.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Informacoes = () => {
    const [loading, setLoading] = useState(true);
    const [loadingCursos, setLoadingCursos] = useState(false);
    const [loadingHabilidadesProfissionais, setLoadingHabilidadesProfissionais] = useState(false);
    const [loadingHabilidadesComportamentais, setLoadingHabilidadesComportamentais] = useState(false);
    const [loadingObjetivos, setLoadingObjetivos] = useState(false);

    // Estados para remoção de cada tag (associado ao valor da tag)
    const [loadingRemoveTags, setLoadingRemoveTags] = useState({});

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
        let setLoading;

        // Defina o estado de loading correto para adição
        if (type === 'cursos') setLoading = setLoadingCursos;
        else if (type === 'habilidadesProfissionais') setLoading = setLoadingHabilidadesProfissionais;
        else if (type === 'habilidadesComportamentais') setLoading = setLoadingHabilidadesComportamentais;
        else if (type === 'objetivos') setLoading = setLoadingObjetivos;

        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }, [fieldMap]);

    const handleRemoveTag = useCallback(async (type, value) => {
        // Inicia o estado de loading para a tag específica
        setLoadingRemoveTags(prevState => ({ ...prevState, [value]: true }));

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
        } finally {
            // Remove o estado de loading após a operação
            setLoadingRemoveTags(prevState => ({ ...prevState, [value]: false }));
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
                        loading={loadingCursos}
                        loadingRemoveTags={loadingRemoveTags}
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
                        loading={loadingHabilidadesProfissionais}
                        loadingRemoveTags={loadingRemoveTags}
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
                        loading={loadingHabilidadesComportamentais}
                        loadingRemoveTags={loadingRemoveTags}
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
                        loading={loadingObjetivos}
                        loadingRemoveTags={loadingRemoveTags}
                    />
                </>
            )}
        </div>
    );
};

const InformacaoCard = ({ title, inputName, inputValue, handleInputChange, tags, handleAddTag, handleRemoveTag, placeholder, loading, loadingRemoveTags }) => (
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
                <div
                    key={index}
                    className={`tag ${loadingRemoveTags[tag] ? 'tag-removing' : ''}`} // Adiciona a classe 'tag-removing' apenas para a tag que está sendo removida
                >
                    {loadingRemoveTags[tag] ? (
                        // Exibe o spinner no centro da tag quando está removendo
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" variant="primary" size="sm"/>
                        </div>
                    ) : (
                        <>
                            <span className='txt-tag'>{tag}</span>
                            <FontAwesomeIcon
                                icon={faTrash}
                                className="tag-close"
                                onClick={() => handleRemoveTag(tag)}
                            />
                        </>
                    )}
                </div>
            ))}
        </div>
        <Button className="btn-adicionar-curriculo mt-4" onClick={handleAddTag} disabled={!inputValue}>
            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <span>Adicionar</span>
            )}
        </Button>
    </div>
);

export default Informacoes;
