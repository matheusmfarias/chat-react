import React, { useState, useEffect } from 'react';
import './ConfigCandidato.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faPencil } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Config = () => {
    const [userData, setUserData] = useState({
        nome: '',
        sobrenome: '',
        maritalStatus: '',
        cpf: '',
        nascimento: '',
        email: '',
        contactPhone: '',
        backupPhone: '',
        street: '',
        number: '',
        district: '',
        city: '',
        profilePicture: '',
        rg: '',
        cnh: '',
        cnhTypes: []
    });

    const notify = (message, type) => {
        toast[type](message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            closeButton: false
        });
    };

    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [preview, setPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [initialUserData, setInitialUserData] = useState({}); // Armazena o estado inicial
    const [isFormChanged, setIsFormChanged] = useState(false);

    const navigate = useNavigate();

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

                const cnhTypes = Array.isArray(user.additionalInfo?.cnhTypes)
                    ? user.additionalInfo.cnhTypes
                    : (typeof user.additionalInfo?.cnhTypes === 'string' ? user.additionalInfo.cnhTypes.split(',') : []);

                const userData = {
                    nome: user.nome,
                    sobrenome: user.sobrenome,
                    maritalStatus: user.additionalInfo?.maritalStatus || '',
                    cpf: user.cpf,
                    nascimento: formattedBirthDate,
                    email: user.email,
                    contactPhone: user.additionalInfo?.contactPhone || '',
                    backupPhone: user.additionalInfo?.backupPhone || '',
                    street: user.address?.street || '',
                    number: user.address?.number || '',
                    district: user.address?.district || '',
                    city: user.address?.city || '',
                    profilePicture: user.profilePicture || '',
                    rg: user.additionalInfo?.rg || '',
                    cnh: !!user.additionalInfo?.cnh, // Certifique-se de que cnh seja booleano
                    cnhTypes: cnhTypes
                };

                setUserData(userData);  // Define o estado atual

                if (user.profilePicture) {
                    const profilePicUrl = `http://localhost:5000${user.profilePicture}`;
                    setPreview(profilePicUrl);
                }

                setInitialUserData(userData);  // Salva o estado inicial para comparação
            } catch (error) {
                console.error('Erro ao buscar os dados do usuário', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const hasFormChanged = JSON.stringify(userData) !== JSON.stringify(initialUserData); // Compara os dois estados
        setIsFormChanged(hasFormChanged); // Atualiza isFormChanged com base na comparação
    }, [userData, initialUserData]);

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

    const handleCnhChange = (e) => {
        const value = e.target.value === 'true'; // Converte o valor para booleano
        setUserData(prevState => ({
            ...prevState,
            cnh: value,
            cnhTypes: value ? prevState.cnhTypes.filter(type => type !== '') : [] // Limpa os tipos de CNH se 'Não tenho' for selecionado
        }));
    };

    const handleCnhTypesChange = (e) => {
        const { value, checked } = e.target;

        setUserData(prevState => {
            const updatedCnhTypes = checked
                ? [...prevState.cnhTypes, value] // Adiciona o tipo ao array se for marcado
                : prevState.cnhTypes.filter(type => type !== value); // Remove o tipo se for desmarcado

            // Filtra qualquer valor vazio que possa ter sido adicionado por acidente
            const filteredCnhTypes = updatedCnhTypes.filter(type => type.trim() !== '');

            return {
                ...prevState,
                cnhTypes: filteredCnhTypes // Atualiza o array sem valores vazios
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

        // Filtrar valores vazios do array cnhTypes antes da validação
        const validCnhTypes = userData.cnhTypes.filter(type => type.trim() !== '');

        if (userData.cnh === true && validCnhTypes.length === 0) {
            notify('Selecione pelo menos uma modalidade de CNH.', 'warning');
            return;
        }

        setLoadingSubmit(true); // Ativa o spinner
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

            notify('Dados atualizados com sucesso!', 'success');
            setIsFormChanged(false); // Reseta o estado do formulário
        } catch (error) {
            console.error('Erro ao atualizar os dados do usuário:', error);
            notify('Erro ao atualizar os dados. Tente novamente.', 'error');
        } finally {
            setLoadingSubmit(false); // Desativa o spinner após a requisição
        }
    };

    const handleEmailChangeClick = () => {
        navigate('/alterar-email');
    };

    return (
        <>
            <ToastContainer />
            <HeaderCandidato />
            <main className='config-content-usuario'>
                <div className='config-container-usuario'>
                    <div className='tabs'>
                        <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>Configurações gerais</button>
                        <button className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>Configurações de endereço</button>
                    </div>
                    {loading ? (
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <>
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
                                                <label htmlFor='nome'>Nome</label>
                                                <input
                                                    type='text'
                                                    id='nome'
                                                    name='nome'
                                                    value={userData.nome}
                                                    onChange={handleNameChange}
                                                />
                                            </div>
                                            <div className='form-group'>
                                                <label htmlFor='sobrenome'>Sobrenome</label>
                                                <input
                                                    type='text'
                                                    id='sobrenome'
                                                    name='sobrenome'
                                                    value={userData.sobrenome}
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
                                                <label htmlFor='nascimento'>Data de nascimento</label>
                                                <input
                                                    type='date'
                                                    id='nascimento'
                                                    name='nascimento'
                                                    value={userData.nascimento}
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
                                                    value={userData.cnh} // userData.cnh agora é booleano
                                                    onChange={handleCnhChange}
                                                >
                                                    <option value={true}>Tenho</option>
                                                    <option value={false}>Não tenho</option>
                                                </select>
                                            </div>
                                            {userData.cnh === true && (
                                                <div className="form-group">
                                                    <div className="cnh-types-checkboxes">
                                                        {['A', 'B', 'C', 'D', 'E'].map(type => (
                                                            <label key={type}>
                                                                <input
                                                                    type="checkbox"
                                                                    value={type}
                                                                    checked={userData.cnhTypes.includes(type)} // Verifica se o tipo está presente no array e marca o checkbox
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
                                                <label htmlFor='district'>Bairro</label>
                                                <input
                                                    type='text'
                                                    id='district'
                                                    name='district'
                                                    value={userData.district}
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
                                <button type='submit' className='save-btn' disabled={!isFormChanged}>
                                    {loadingSubmit ? (
                                        <div className="d-flex justify-content-center">
                                            <Spinner animation="border" variant="white" />
                                        </div>
                                    ) : (
                                        <span>Salvar</span>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </>
    );
};

export default Config;
