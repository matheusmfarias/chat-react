import React, { useContext, useState } from 'react';
import './Curriculo.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import { LoadingContext } from '../../../context/LoadingContext';

const Curriculo = () => {
    const { showLoading, hideLoading } = useContext(LoadingContext);
    const [activeTab, setActiveTab] = useState('experiencia');
    const [experiencias, setExperiencias] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newExperiencia, setNewExperiencia] = useState({
        empresa: '',
        dataInicial: '',
        dataFinal: '',
        funcao: '',
        atividades: ''
    });

    const handleAddExperiencia = () => {
        setExperiencias([...experiencias, newExperiencia]);
        setShowPopup(false);
        setNewExperiencia({
            empresa: '',
            dataInicial: '',
            dataFinal: '',
            funcao: '',
            atividades: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExperiencia({ ...newExperiencia, [name]: value });
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
                        {activeTab === "experiencia" && (
                            <>
                                <h3>Experiência profissional</h3>
                                <div className='form-columns-container'>
                                    {experiencias.length === 0 ? (
                                        <p>Nenhuma experiência informada. Clique em "Adicionar" para cadastrar.</p>
                                    ) : (
                                        experiencias.map((exp, index) => (
                                            <div key={index} className="experience-card">
                                                <div className="card-header">
                                                    <h4>{exp.empresa}</h4>
                                                    <p>{exp.funcao}</p>
                                                </div>
                                                <div className="card-body">
                                                    <p>Período: {exp.dataInicial} - {exp.dataFinal}</p>
                                                    <p>Atividades: {exp.atividades}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <button type="button" className="add-experience-btn" onClick={() => setShowPopup(true)}>Adicionar</button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </main>
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Adicionar Experiência</h3>
                        <form>
                            <div className="form-group">
                                <label>Empresa</label>
                                <input type="text" name="empresa" value={newExperiencia.empresa} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Data Inicial</label>
                                <input type="date" name="dataInicial" value={newExperiencia.dataInicial} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Data Final</label>
                                <input type="date" name="dataFinal" value={newExperiencia.dataFinal} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Função/Cargo</label>
                                <input type="text" name="funcao" value={newExperiencia.funcao} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Principais Atividades</label>
                                <textarea name="atividades" value={newExperiencia.atividades} onChange={handleInputChange}></textarea>
                            </div>
                            <button type="button" onClick={handleAddExperiencia}>Adicionar</button>
                            <button type="button" onClick={() => setShowPopup(false)}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Curriculo;
