import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie";
import './Curriculo.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import Experiencia from './Experiencia';
import Formacao from './Formacao';
import Informacoes from './Informacoes';
import { Button, Container } from 'react-bootstrap';
import VisualizarCurriculo from './VisualizarCurriculo';

const Curriculo = () => {
    const [activeTab, setActiveTab] = useState('experiencia');
    const [experiencias, setExperiencias] = useState([]);
    const [formacoes, setFormacoes] = useState([]);
    const [informacoes, setInformacoes] = useState({});
    const [viewCurriculo, setViewCurriculo] = useState(false);
    const userId = Cookies.get('userId');

    useEffect(() => {
        document.title = "ACI Empregos | Currículo";
    }, []);

    const handleViewCurriculo = () => {
        setViewCurriculo(true); // Atualiza o estado para true
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
                        <Button variant='secondary' onClick={handleViewCurriculo}>Visualizar Currículo</Button>
                    </Container>
                </div>
            </main>

            {viewCurriculo && (
                <VisualizarCurriculo
                    userId={userId}
                    onClose={() => setViewCurriculo(false)}
                />
            )}
        </>
    );
};

export default Curriculo;