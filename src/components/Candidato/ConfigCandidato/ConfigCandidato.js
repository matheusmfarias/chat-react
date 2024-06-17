import React, { useState, useEffect } from 'react';
import './ConfigCandidato.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import Footer from '../../Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Config = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        maritalStatus: '',
        cpf: '',
        birthDate: '',
        email: '',
        contactPhone: '',
        backupPhone: '',
        address: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token'); // Assumindo que o token está armazenado no localStorage
                const response = await axios.get('http://localhost:5000/api/user/candidato', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const user = response.data;
                const formattedBirthDate = user.nascimento ? user.nascimento.split('T')[0] : '';

                setUserData({
                    firstName: user.nome,
                    lastName: user.sobrenome,
                    maritalStatus: user.estadoCivil,
                    cpf: user.cpf,
                    birthDate: formattedBirthDate,
                    email: user.email,
                    contactPhone: user.telefoneContato,
                    backupPhone: user.telefoneRecado,
                    address: user.endereco
                });
            } catch (error) {
                console.error('Erro ao buscar os dados do usuário', error);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <>
            <HeaderCandidato />
            <main className='config-content-usuario'>
                <div className='config-container-usuario'>
                    <div className='profile-header'>
                        <FontAwesomeIcon icon={faCircleUser} className='profile-avatar' />
                        <button className='change-photo-btn'>Alterar foto</button>
                    </div>
                    <form className='profile-form'>
                        <div className='form-column'>
                            <div className='form-group'>
                                <label htmlFor='firstName'>Nome</label>
                                <input
                                    type='text'
                                    id='firstName'
                                    name='firstName'
                                    value={userData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='lastName'>Sobrenome</label>
                                <input
                                    type='text'
                                    id='lastName'
                                    name='lastName'
                                    value={userData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='maritalStatus'>Estado civil</label>
                                <select
                                    id='maritalStatus'
                                    name='maritalStatus'
                                    value={userData.maritalStatus}
                                    onChange={handleChange}
                                >
                                    <option value='solteiro'>Solteiro(a)</option>
                                    <option value='casado'>Casado(a)</option>
                                    <option value='divorciado'>Divorciado(a)</option>
                                    <option value='viuvo'>Viúvo(a)</option>
                                </select>
                            </div>
                            <div className='form-group'>
                                <label htmlFor='cpf'>CPF</label>
                                <input
                                    type='text'
                                    id='cpf'
                                    name='cpf'
                                    value={userData.cpf}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='birthDate'>Data de nascimento</label>
                                <input
                                    type='date'
                                    id='birthDate'
                                    name='birthDate'
                                    value={userData.birthDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className='form-column'>
                            <div className='form-group'>
                                <label htmlFor='email'>E-mail</label>
                                <input
                                    type='email'
                                    id='email'
                                    name='email'
                                    value={userData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='contactPhone'>Telefone de contato</label>
                                <input
                                    type='tel'
                                    id='contactPhone'
                                    name='contactPhone'
                                    value={userData.contactPhone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='backupPhone'>Telefone para recado</label>
                                <input
                                    type='tel'
                                    id='backupPhone'
                                    name='backupPhone'
                                    value={userData.backupPhone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='address'>Endereço</label>
                                <input
                                    type='text'
                                    id='address'
                                    name='address'
                                    value={userData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <button type='submit' className='save-btn'>Salvar</button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Config;
