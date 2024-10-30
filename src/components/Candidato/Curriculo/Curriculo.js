import React, { useState, useEffect, useCallback } from 'react';
import './Curriculo.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import Experiencia from './Experiencia';
import Formacao from './Formacao';
import Informacoes from './Informacoes';
import CurriculoTemplate from './CurriculoTemplate';
import api from '../../../services/axiosConfig';
import { createRoot } from 'react-dom/client';
import { Button, Container } from 'react-bootstrap';

const Curriculo = () => {
    const [activeTab, setActiveTab] = useState('experiencia');
    const [experiencias, setExperiencias] = useState([]);
    const [formacoes, setFormacoes] = useState([]);
    const [informacoes, setInformacoes] = useState({});

    const fetchUserInfo = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/candidato`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const user = response.data;

            setInformacoes({
                nome: user.nome,
                sobrenome: user.sobrenome,
                dataNascimento: user.nascimento ? user.nascimento.split('T')[0] : '',
                email: user.email,
                telefoneContato: user.additionalInfo?.contactPhone || '',
                telefoneRecado: user.additionalInfo?.backupPhone || '',
                cnh: user.additionalInfo?.cnh || 'Não tenho',
                tipoCnh: user.additionalInfo?.cnhTypes || [],
                fotoPerfil: `${process.env.REACT_APP_API_URL}${user.profilePicture}` || '',
                habilidadesProfissionais: user.habilidadesProfissionais || [],
                habilidadesComportamentais: user.habilidadesComportamentais || [],
                cursos: user.cursos || [],
                objetivos: user.objetivos || []
            });

            setExperiencias(user.experiences || []);
            setFormacoes(user.formacao || []);
        } catch (error) {
            console.error('Erro ao buscar informações do usuário', error);
        }
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const injectStyles = (newWindow) => {
        const bootstrapLink = newWindow.document.createElement('link');
        bootstrapLink.rel = 'stylesheet';
        bootstrapLink.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
        newWindow.document.head.appendChild(bootstrapLink);

        const customLink = newWindow.document.createElement('link');
        customLink.rel = 'stylesheet';
        customLink.href = `${window.location.origin}/CurriculoTemplate.css`;
        newWindow.document.head.appendChild(customLink);

        return { bootstrapLink, customLink };
    };

    const handleViewCurriculo = useCallback(() => {
        const newWindow = window.open('', '', 'width=1024,height=768');
        newWindow.document.write('<html><head><title>Currículo</title></head><body><div id="curriculo-template-root"></div></body></html>');

        const { bootstrapLink, customLink } = injectStyles(newWindow);

        const renderCurriculo = () => {
            const root = createRoot(newWindow.document.getElementById('curriculo-template-root'));
            root.render(
                <CurriculoTemplate
                    experiencias={experiencias}
                    formacoes={formacoes}
                    informacoes={informacoes}
                />
            );
        };

        bootstrapLink.onload = () => customLink.onload = renderCurriculo;
        newWindow.document.close();
    }, [experiencias, formacoes, informacoes]);

    return (
        <>
            <HeaderCandidato />
            <main className='curriculo-content-usuario'>
                <div className='curriculo-container-usuario'>
                    <div className='tabs-curriculo'>
                        <button className={activeTab === 'experiencia' ? 'active' : ''} onClick={() => setActiveTab('experiencia')}>Experiência</button>
                        <button className={activeTab === 'formacao' ? 'active' : ''} onClick={() => setActiveTab('formacao')}>Formação</button>
                        <button className={activeTab === 'adicionais' ? 'active' : ''} onClick={() => setActiveTab('adicionais')}>Informações</button>
                    </div>

                    <Container className='curriculo-form'>
                        {activeTab === "experiencia" && <Experiencia experiencias={experiencias} setExperiencias={setExperiencias} />}
                        {activeTab === "formacao" && <Formacao formacoes={formacoes} setFormacoes={setFormacoes} />}
                        {activeTab === "adicionais" && <Informacoes informacoes={informacoes} setInformacoes={setInformacoes} />}
                    </Container>

                    <Container className='d-flex justify-content-center align-items-center'>
                        <Button className="btn-adicionar-curriculo" variant='secondary' onClick={handleViewCurriculo}>Visualizar Currículo</Button>
                    </Container>
                </div>
            </main>
        </>
    );
};

export default Curriculo;
