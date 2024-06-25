import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import './VagasEmpresa.css';
import HeaderEmpresa from '../HeaderEmpresa';
import { FaPlus, FaFilter, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const VagasEmpresa = () => {
    const [jobs, setJobs] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        location: '',
        modality: '',
        type: '',
        salary: '',
        number: '',
        status: ''
    });

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem('token'); // Certifique-se de que o token está definido
            if (token) {
                try {
                    const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setJobs(jobsResponse.data);
                } catch (error) {
                    console.error('Error fetching jobs:', error);
                }
            }
        };

        fetchJobs();
    }, []);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewJob({ ...newJob, [name]: value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.post('http://localhost:5000/api/jobs', newJob, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setJobs([...jobs, newJob]);
                closeModal();
            } catch (error) {
                console.error('Error adding job:', error);
            }
        }
    };

    return (
        <>
            <HeaderEmpresa />
            <div className="visualizar-vagas-container">
                <div className='vagas-empresa-content'>
                    <h1>Minhas Vagas</h1>
                    <div className="top-bar">
                        <div className="buttons">
                            <button className="vagas-btn" onClick={openModal}>
                                <FaPlus className="icon" />
                                <span>Adicionar</span>
                            </button>
                            <button className="vagas-btn">
                                <FaFilter className="icon" />
                                <span>Filtro</span>
                            </button>
                        </div>
                        <div className="search-bar">
                            <input type="text" placeholder="Pesquisar" className="search-input" />
                            <button className="search-btn">
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                    <table className="vagas-table">
                        <thead>
                            <tr>
                                <th>CARGO</th>
                                <th>LOCALIDADE</th>
                                <th>MODELO</th>
                                <th>TIPO</th>
                                <th>SALÁRIO</th>
                                <th>N°</th>
                                <th>STATUS</th>
                                <th>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job, index) => (
                                <tr key={index}>
                                    <td>{job.title}</td>
                                    <td>{job.location}</td>
                                    <td>{job.modality}</td>
                                    <td>{job.type}</td>
                                    <td>{job.salary}</td>
                                    <td>{job.number}</td>
                                    <td>{job.status}</td>
                                    <td>
                                        <button className="btn-action btn-edit">
                                            <FaEdit />
                                        </button>
                                        <button className="btn-action btn-delete">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Adicionar Vaga"
                className="Modal"
                overlayClassName="Overlay"
            >
                <h2>Adicionar Vaga</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                        <label>Cargo</label>
                        <input
                            type="text"
                            name="title"
                            value={newJob.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Localidade</label>
                        <input
                            type="text"
                            name="location"
                            value={newJob.location}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Modelo</label>
                        <input
                            type="text"
                            name="modality"
                            value={newJob.modality}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Tipo</label>
                        <input
                            type="text"
                            name="type"
                            value={newJob.type}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Salário</label>
                        <input
                            type="text"
                            name="salary"
                            value={newJob.salary}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Número</label>
                        <input
                            type="number"
                            name="number"
                            value={newJob.number}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <input
                            type="text"
                            name="status"
                            value={newJob.status}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit" className="modal-btn">Adicionar</button>
                    <button type="button" onClick={closeModal} className="modal-btn">Cancelar</button>
                </form>
            </Modal>
        </>
    );
};

export default VagasEmpresa;
