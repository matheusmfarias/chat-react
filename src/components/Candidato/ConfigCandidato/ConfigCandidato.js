import React, { useState, useEffect } from 'react';
import './ConfigCandidato.css';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faPencil } from '@fortawesome/free-solid-svg-icons';
import api from '../../../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactSelect from 'react-select';

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
        document.title = "ACI Empregos | Perfil";
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/candidato`, {
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
                    const profilePicUrl = `${process.env.REACT_APP_API_URL}${user.profilePicture}`;
                    setPreview(profilePicUrl);  // Salva a URL completa para preview
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

    const handleMaritalChange = (name, value) => {
        setUserData(prevState => ({
            ...prevState,
            [name]: value  // Atualiza o campo específico do estado
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
            if (!selectedFile.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem.');
                return;
            }
                        
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

            const response = await api.put(`${process.env.REACT_APP_API_URL}/api/user/candidato`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.profilePicture) {
                // Atualiza o preview com o caminho da nova imagem
                const updatedProfilePicUrl = `${process.env.REACT_APP_API_URL}${response.data.profilePicture}`;
                setPreview(updatedProfilePicUrl);
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

    const cnhOptions = [
        { value: 'true', label: 'Tenho' },
        { value: 'false', label: 'Não tenho' }
    ];

    const maritalOptions = [
        { value: 'solteiro', label: 'Solteiro(a)' },
        { value: 'casado', label: 'Casado(a)' },
        { value: 'divorciado', label: 'Divorciado(a)' },
        { value: 'viuvo', label: 'Viúvo(a)' }
    ];

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            width: '100%',
            padding: '0 15px',               // Adiciona padding horizontal
            border: '2px solid #D3D3D3',
            borderRadius: '8px',
            fontSize: '16px',
            height: '58px',               // Define a altura mínima para 58px
            display: 'flex',
            alignItems: 'center',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(31, 82, 145, 0.25)' : 'none',
            '&:hover': {
                borderColor: '#1F5291',
            }
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '54px',
            padding: '0',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#1F5291' : 'white',
            color: state.isSelected ? 'white' : '#575e67',
            padding: '15px',
            fontSize: '16px',
            '&:hover': {
                backgroundColor: '#286abb',
                color: 'white',
            }
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '8px',
            marginTop: '5px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#1F5291',
            '&:hover': {
                color: '#286abb',
            }
        }),
        indicatorSeparator: () => ({
            display: 'none',
        })
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
                        <div className="d-flex justify-content-center align-items-center">
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
                                <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
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
                                                <ReactSelect
                                                    id='maritalStatus'
                                                    name='maritalStatus'
                                                    value={maritalOptions.find(option => option.value === userData.maritalStatus)}  // Ajuste para exibir o valor correto
                                                    onChange={(selectedOption) => handleMaritalChange('maritalStatus', selectedOption.value)}  // Ajuste do onChange
                                                    options={maritalOptions}
                                                    styles={customStyles}
                                                    isSearchable={false}
                                                />
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
                                                <ReactSelect
                                                    id='cnh'
                                                    name='cnh'
                                                    value={cnhOptions.find(option => option.value === String(userData.cnh))}
                                                    onChange={(selectedOption) => handleCnhChange({ target: { value: selectedOption.value } })}
                                                    options={cnhOptions}
                                                    styles={customStyles}
                                                    isSearchable={false}
                                                />
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
                                <button type='submit' className='save-btn d-flex justify-content-center' disabled={!isFormChanged}>
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
