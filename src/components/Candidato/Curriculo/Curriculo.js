// Curriculo.js
import React, { useState, useEffect, useCallback } from 'react';
import './Curriculo.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import Experiencia from './Experiencia';
import Formacao from './Formacao';
import Informacoes from './Informacoes';
import CurriculoTemplate from './CurriculoTemplate';
import axios from 'axios';
import ReactDOM from 'react-dom';

const Curriculo = () => {
    const [activeTab, setActiveTab] = useState('experiencia');
    const [experiencias, setExperiencias] = useState([]);
    const [formacoes, setFormacoes] = useState([]);
    const [informacoes, setInformacoes] = useState({});

    const fetchUserInfo = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/user/candidato', {
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
                fotoPerfil: `http://localhost:5000${user.profilePicture}` || '',
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

    const handleViewCurriculo = () => {
        fetchUserInfo(); // Garantir que os dados sejam atualizados antes de visualizar o currículo

        // Abrir uma nova janela
        const newWindow = window.open('', '', 'width=800,height=600');
        newWindow.document.write('<html><head><title>Currículo</title></head><body><div id="curriculo-template-root"></div></body></html>');

        // Injetar link CSS do Bootstrap na nova janela
        const bootstrapLink = newWindow.document.createElement('link');
        bootstrapLink.rel = 'stylesheet';
        bootstrapLink.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
        newWindow.document.head.appendChild(bootstrapLink);

        // Injetar link CSS personalizado na nova janela
        const customLink = newWindow.document.createElement('link');
        customLink.rel = 'stylesheet';
        customLink.type = 'text/css';
        customLink.href = `${window.location.origin}/CurriculoTemplate.css`;
        newWindow.document.head.appendChild(customLink);

        // Garantir que os links CSS sejam carregados antes de renderizar o componente
        const renderCurriculo = () => {
            ReactDOM.render(
                <CurriculoTemplate
                    experiencias={experiencias}
                    formacoes={formacoes}
                    informacoes={informacoes}
                />,
                newWindow.document.getElementById('curriculo-template-root')
            );
        };

        bootstrapLink.onload = () => {
            customLink.onload = renderCurriculo;
        };

        newWindow.document.close(); // Necessário para garantir que o conteúdo do documento seja carregado
    };

    return (
        <>
            <HeaderCandidato />
            <main className='curriculo-content-usuario'>
                <div className='curriculo-container-usuario'>
                    <div className='tabs'>
                        <button className={activeTab === 'experiencia' ? 'active' : ''} onClick={() => setActiveTab('experiencia')}>Experiência</button>
                        <button className={activeTab === 'formacao' ? 'active' : ''} onClick={() => setActiveTab('formacao')}>Formação</button>
                        <button className={activeTab === 'adicionais' ? 'active' : ''} onClick={() => setActiveTab('adicionais')}>Informações</button>
                    </div>

                    <form className='curriculo-form'>
                        {activeTab === "experiencia" && <Experiencia experiencias={experiencias} setExperiencias={setExperiencias} />}
                        {activeTab === "formacao" && <Formacao formacoes={formacoes} setFormacoes={setFormacoes} />}
                        {activeTab === "adicionais" && <Informacoes informacoes={informacoes} setInformacoes={setInformacoes} />}
                    </form>
                    <button className='btn-visualizar-curriculo' onClick={handleViewCurriculo}>Visualizar Currículo</button>
                </div>
            </main>
        </>
    );
}

export default Curriculo;
