import React, { useState, useEffect, useCallback } from 'react';
import './Curriculo.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import Experiencia from './Experiencia';
import Formacao from './Formacao';
import Informacoes from './Informacoes';
import CurriculoTemplate from './CurriculoTemplate';
import api from '../../../services/axiosConfig';
import { createRoot } from 'react-dom/client';
import { Button, Container, Spinner } from 'react-bootstrap';

const Curriculo = () => {
    const [activeTab, setActiveTab] = useState('experiencia');
    const [experiencias, setExperiencias] = useState([]);
    const [formacoes, setFormacoes] = useState([]);
    const [informacoes, setInformacoes] = useState({});
    const [loading, setLoading] = useState(true); // Estado de carregamento

    const fetchUserInfo = useCallback(async () => {
        try {
            setLoading(true); // Inicia o carregamento
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
        } finally {
            setLoading(false); // Finaliza o carregamento
        }
    }, []);

    useEffect(() => {
        document.title = "ACI Empregos | Currículo";
        fetchUserInfo();
    }, [fetchUserInfo]);

    const handleViewCurriculo = () => {
        if (loading) {
            return; // Se os dados estiverem carregando, não abrir a nova janela
        }

        // Abre uma nova janela para renderizar o currículo
        const newWindow = window.open('', '_blank', 'width=1024,height=768');
        if (!newWindow) {
            console.error("Não foi possível abrir a nova janela. Verifique se pop-ups estão bloqueados.");
            return;
        }

        newWindow.document.write(`
            <html>
                <head>
                    <title>Currículo</title>
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
                    <link rel="stylesheet" href="${window.location.origin}/CurriculoTemplate.css">
                </head>
                <body>
                    <div id="curriculo-template-root"></div>
                </body>
            </html>
        `);
        newWindow.document.close();

        // Espera a janela estar pronta para manipular o conteúdo
        newWindow.onload = () => {
            const rootElement = newWindow.document.getElementById('curriculo-template-root');
            if (rootElement) {
                const root = createRoot(rootElement);
                root.render(
                    <CurriculoTemplate
                        experiencias={experiencias}
                        formacoes={formacoes}
                        informacoes={informacoes}
                    />
                );
            } else {
                console.error("Elemento root não encontrado na nova janela.");
            }
        };
    };

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
                        {loading ? (
                            <Spinner animation="border" variant="primary" />
                        ) : (
                            <Button className="btn-adicionar-curriculo" variant='secondary' onClick={handleViewCurriculo}>Visualizar Currículo</Button>
                        )}
                    </Container>
                </div>
            </main>
        </>
    );
};

export default Curriculo;
