import React, { useState } from 'react';
import './Curriculo.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import Experiencia from './Experiencia';
import Formacao from './Formacao';
import Informacoes from './Informacoes';

const Curriculo = () => {
    const [activeTab, setActiveTab] = useState('experiencia');
    const [experiencias, setExperiencias] = useState([]);

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
                        {activeTab === "formacao" && <Formacao />}
                        {activeTab === "adicionais" && <Informacoes />}
                    </form>
                </div>
            </main>
        </>
    );
}

export default Curriculo;
