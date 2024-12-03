import React, { useState, useEffect } from 'react';
import './AddProfilePicture.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../../../services/axiosConfig';

const AddProfilePicture = ({ onNext }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const savedPreview = localStorage.getItem('profilePicturePreview');
        if (savedPreview) {
            setPreview(savedPreview);
        }
    }, []);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            // Verifica se o arquivo é uma imagem (por extensão MIME)
            if (!selectedFile.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem.');
                return;
            }

            setFile(selectedFile);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                localStorage.setItem('profilePicturePreview', reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setFile(null);
            setPreview(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file && !preview) {
            console.error('No file selected');
            return;
        }

        if (file) {
            const formData = new FormData();
            formData.append('profilePicture', file);

            try {
                await api.post(`${process.env.REACT_APP_API_URL}/api/user/profile-picture`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } catch (error) {
                console.error('Error uploading profile picture', error);
                return;
            }
        }

        onNext(); // Certifica que a função onNext é chamada corretamente
    };

    return (
        <div className="profile-setup-container">
            <div className="welcome-message">
                <h1>Bem-vindo!</h1>
                <p>Vamos configurar seu perfil para começar a encontrar as melhores vagas de emprego para você.</p>
                <p>Por favor, adicione uma foto de perfil.</p>
            </div>
            <div className="profile-picture-container">
                {preview ? (
                    <img src={preview} alt="Profile Preview" className="profile-picture-preview" />
                ) : (
                    <FontAwesomeIcon icon={faUserCircle} className="profile-picture-icon" />
                )}
                {/* O atributo accept permite que apenas arquivos de imagem sejam selecionados */}
                <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <label htmlFor="profilePicture" className="change-photo-btn">Escolher foto</label>
            </div>
            <button className="confirm-btn" onClick={handleSubmit} disabled={!preview}>Avançar</button>
        </div>
    );
};

export default AddProfilePicture;
