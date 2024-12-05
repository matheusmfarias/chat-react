import React, { useState, useEffect } from 'react';
import './AddProfilePicture.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'react-bootstrap'; // Adicionado para o spinner
import api from '../../../services/axiosConfig';
import imageCompression from 'browser-image-compression';

const AddProfilePicture = ({ onNext }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedPreview = localStorage.getItem('profilePicturePreview');
        if (savedPreview) {
            setPreview(savedPreview);
        }
    }, []);

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem.');
                return;
            }

            try {
                // Configuração para compressão da imagem
                const options = {
                    maxSizeMB: 1, // Tamanho máximo em MB (ajustável)
                    maxWidthOrHeight: 1024, // Largura/altura máxima em pixels
                    useWebWorker: true, // Usa Web Worker para melhorar o desempenho
                };

                // Comprime a imagem
                const compressedFile = await imageCompression(selectedFile, options);

                setFile(compressedFile);

                // Exibe o preview da imagem comprimida
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                    localStorage.setItem('profilePicturePreview', reader.result);
                };
                reader.readAsDataURL(compressedFile);

                // Simula o upload da imagem
                setIsUploading(true);
                const formData = new FormData();
                formData.append('profilePicture', compressedFile);

                try {
                    await api.post(`${process.env.REACT_APP_API_URL}/api/user/profile-picture`, formData, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                } catch (error) {
                    console.error('Error uploading profile picture', error);
                    alert('Falha no upload da foto. Tente novamente.');
                } finally {
                    setIsUploading(false);
                }
            } catch (error) {
                console.error('Erro ao comprimir a imagem:', error);
                alert('Erro ao processar a imagem. Tente novamente.');
            }
        } else {
            setFile(null);
            setPreview(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file && !preview) {
            console.error('Nenhum arquivo selecionado.');
            return;
        }

        setIsSubmitting(true); // Inicia o spinner no botão
        try {
            // Avança para o próximo passo
            onNext();
        } catch (error) {
            console.error('Erro ao enviar foto', error);
            alert('Erro ao avançar. Verifique sua conexão e tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="profile-setup-container">
            <div className="welcome-message">
                <h1>Bem-vindo!</h1>
                <p>Vamos configurar seu perfil para começar a encontrar as melhores vagas de emprego para você.</p>
                <p>Por favor, adicione uma foto de perfil.</p>
            </div>
            <div className="profile-picture-container">
                {isUploading ? (
                    <div className="profile-picture-preview d-flex justify-content-center align-items-center bg-light">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : preview ? (
                    <img src={preview} alt="Profile Preview" className="profile-picture-preview" />
                ) : (
                    <FontAwesomeIcon icon={faUserCircle} className="profile-picture-icon" />
                )}
                <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <label htmlFor="profilePicture" className="change-photo-btn">
                    Escolher foto
                </label>
            </div>
            <button
                className="confirm-btn"
                onClick={handleSubmit}
                disabled={!preview || isSubmitting || isUploading}
            >
                {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Avançar'}
            </button>
        </div>
    );
};

export default AddProfilePicture;
