import React, { useState, useEffect, useContext } from 'react';
import './ConfigCandidato.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faPencil } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoadingContext } from "../../../context/LoadingContext";

const Config = () => {
    const { showLoading, hideLoading } = useContext(LoadingContext);
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
        profilePicture: '',
        rg: '',
        cnh: '',
        cnhTypes: []
    });

    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [isFormChanged, setIsFormChanged] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        showLoading();
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
                    maritalStatus: user.additionalInfo?.maritalStatus || '',
                    cpf: user.cpf,
                    birthDate: formattedBirthDate,
                    email: user.email,
                    contactPhone: user.additionalInfo?.contactPhone || '',
                    backupPhone: user.additionalInfo?.backupPhone || '',
                    street: user.address?.street || '',
                    number: user.address?.number || '',
                    neighborhood: user.address?.district || '',
                    city: user.address?.city || '',
                    profilePicture: user.profilePicture || '',
                    rg: user.additionalInfo?.rg || '',
                    cnh: user.additionalInfo?.cnh || '',
                    cnhTypes: user.additionalInfo?.cnhTypes || []
                });

                if (user.profilePicture) {
                    const profilePicUrl = `http://localhost:5000${user.profilePicture}`;
                    setPreview(profilePicUrl);
                }
            } catch (error) {
                console.error('Erro ao buscar os dados do usuário', error);
            } finally {
                hideLoading();
            }
        };

        fetchUserData();
    }, [showLoading, hideLoading]);

    useEffect(() => {
        setIsFormChanged(true);
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNameChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); // Permitir letras e acentos
        setUserData(prevState => ({
            ...prevState,
            [name]: formattedValue
        }));
    };

    const handleRgChange = (e) => {
        const { value } = e.target;
        const formattedValue = value.replace(/\D/g, '');
        setUserData(prevState => ({
            ...prevState,
            rg: formattedValue
        }));
    };

    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
        setUserData(prevState => ({
            ...prevState,
            [name]: formattedValue
        }));
    };

    const handleCnhTypesChange = (e) => {
        const { value, checked } = e.target;
        setUserData(prevState => {
            const newCnhTypes = checked
                ? [...(prevState.cnhTypes || []), value]
                : (prevState.cnhTypes || []).filter(type => type !== value);
            return {
                ...prevState,
                cnhTypes: newCnhTypes
            };
        });
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
        showLoading();
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
            setIsFormChanged(false);
        } catch (error) {
            console.error('Erro ao atualizar os dados do usuário:', error);
            setMessage('Erro ao atualizar os dados. Tente novamente.');
        } finally {
            hideLoading();
        }
    };

    const handleEmailChangeClick = () => {
        navigate('/alterar-email');
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
                            <div className="form-columns-container">
                                <div className='form-column'>
                                    <div className='form-group'>
                                        <label htmlFor='firstName'>Nome</label>
                                        <input
                                            type='text'
                                            id='firstName'
                                            name='firstName'
                                            value={userData.firstName}
                                            onChange={handleNameChange}
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='lastName'>Sobrenome</label>
                                        <input
                                            type='text'
                                            id='lastName'
                                            name='lastName'
                                            value={userData.lastName}
                                            onChange={handleNameChange}
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
                                            disabled
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='rg'>RG</label>
                                        <input
                                            type='text'
                                            id='rg'
                                            name='rg'
                                            maxLength='10'
                                            value={userData.rg}
                                            onChange={handleRgChange}
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
                                        <div className='email-input-container'>
                                            <input
                                                type='email'
                                                id='email'
                                                name='email'
                                                value={userData.email}
                                                onChange={handleChange}
                                                disabled
                                            />
                                            <button type='button' className='change-email-btn' onClick={handleEmailChangeClick}>
                                                <FontAwesomeIcon icon={faPencil} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='contactPhone'>Telefone de contato</label>
                                        <input
                                            type='tel'
                                            id='contactPhone'
                                            name='contactPhone'
                                            value={userData.contactPhone}
                                            onChange={handlePhoneChange}
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='backupPhone'>Telefone para recado</label>
                                        <input
                                            type='tel'
                                            id='backupPhone'
                                            name='backupPhone'
                                            value={userData.backupPhone}
                                            onChange={handlePhoneChange}
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='cnh'>CNH</label>
                                        <select
                                            id='cnh'
                                            name='cnh'
                                            value={userData.cnh}
                                            onChange={(e) => {
                                                const { value } = e.target;
                                                setUserData(prevState => ({
                                                    ...prevState,
                                                    cnh: value,
                                                    cnhTypes: value === 'Tenho' ? prevState.cnhTypes : []
                                                }));
                                            }}
                                        >
                                            <option value='Tenho'>Tenho</option>
                                            <option value='Não tenho'>Não tenho</option>
                                        </select>
                                    </div>
                                    {userData.cnh === 'Tenho' && (
                                        <div className="form-group">
                                            <div className="cnh-types-checkboxes">
                                                {['A', 'B', 'C', 'D', 'E'].map(type => (
                                                    <label key={type}>
                                                        <input
                                                            type="checkbox"
                                                            value={type}
                                                            checked={userData.cnhTypes.includes(type)}
                                                            onChange={handleCnhTypesChange}
                                                        />
                                                        {type}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'address' && (
                            <div className="form-columns-container">
                                <div className='form-column'>
                                    <div className='form-group'>
                                        <label htmlFor='street'>Logradouro</label>
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
                            </div>
                        )}
                        <button type='submit' className='save-btn' disabled={!isFormChanged}>Salvar</button>
                    </form>
                    {message && <p>{message}</p>}
                </div>
            </main>
        </>
    );
};

export default Config;
