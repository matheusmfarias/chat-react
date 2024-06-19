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
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        profilePicture: ''
    });

    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
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
                    maritalStatus: user.additionalInfo?.maritialStatus || '',
                    cpf: user.cpf,
                    birthDate: formattedBirthDate,
                    email: user.email,
                    contactPhone: user.additionalInfo?.contactPhone || '',
                    backupPhone: user.additionalInfo?.backupPhone || '',
                    street: user.address?.street || '',
                    number: user.address?.number || '',
                    neighborhood: user.address?.district || '',
                    city: user.address?.city || '',
                    profilePicture: user.profilePicture || ''
                });

                if (user.profilePicture) {
                    const profilePicUrl = `http://localhost:5000${user.profilePicture}`;
                    setPreview(profilePicUrl);
                }
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

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setUserData(prevState => ({
                ...prevState,
                profilePicture: selectedFile
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setUserData(prevState => ({
                ...prevState,
                profilePicture: ''
            }));
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            Object.keys(userData).forEach(key => {
                if (key !== 'profilePicture') {
                    formData.append(key, userData[key]);
                }
            });

            if (userData.profilePicture instanceof File) {
                formData.append('profilePicture', userData.profilePicture);
            }

            const response = await axios.put('http://localhost:5000/api/user/candidato', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.profilePicture) {
                setPreview(`http://localhost:5000${response.data.profilePicture}`);
            }

            setMessage('Dados atualizados com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar os dados do usuário', error);
            setMessage('Erro ao atualizar os dados. Tente novamente.');
        }
    };

    return (
        <>
            <HeaderCandidato />
            <main className='config-content-usuario'>
                <div className='config-container-usuario'>
                    <div className='tabs'>
                        <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>Configurações gerais</button>
                        <button className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>Configurações de endereço</button>
                    </div>
                    <div className='profile-header'>
                        {preview ? (
                            <img src={preview} alt="Profile Preview" className="profile-avatar" />
                        ) : (
                            <FontAwesomeIcon icon={faCircleUser} className='profile-avatar' />
                        )}
                        <input type="file" id="profilePicture" onChange={handleFileChange} style={{ display: 'none' }} />
                        <label htmlFor="profilePicture" className="save-btn">Alterar foto</label>
                    </div>
                    <form className='profile-form' onSubmit={handleSubmit}>
                        {activeTab === 'general' && (
                            <>
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
                                </div>
                                <div className='form-column'>
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
                                </div>
                            </>
                        )}
                        {activeTab === 'address' && (
                            <>
                                <div className='form-column'>
                                    <div className='form-group'>
                                        <label htmlFor='street'>Rua</label>
                                        <input
                                            type='text'
                                            id='street'
                                            name='street'
                                            value={userData.street}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='number'>Número</label>
                                        <input
                                            type='text'
                                            id='number'
                                            name='number'
                                            value={userData.number}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className='form-column'>
                                    <div className='form-group'>
                                        <label htmlFor='neighborhood'>Bairro</label>
                                        <input
                                            type='text'
                                            id='neighborhood'
                                            name='neighborhood'
                                            value={userData.neighborhood}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='city'>Cidade</label>
                                        <input
                                            type='text'
                                            id='city'
                                            name='city'
                                            value={userData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <button type='submit' className='save-btn'>Salvar</button>
                    </form>
                    {message && <p>{message}</p>}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Config;
