import React, { useState, useEffect } from 'react';
import AddProfilePicture from './AddProfilePicture';
import AddAddress from './AddAddress';
import AddAdditionalInfo from './AddAdditionalInfo';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
    const [step, setStep] = useState(() => {
        const savedStep = localStorage.getItem('profileSetupStep');
        return savedStep ? parseInt(savedStep, 10) : 1;
    });
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('profileSetupStep', step);
        document.title = "ACI Empregos | Configuração de Perfil";
    }, [step]);

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };

    const handleComplete = () => {
        localStorage.removeItem('profileSetupStep');
        navigate('/dashboard');
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <AddProfilePicture onNext={handleNextStep} />;
            case 2:
                return <AddAddress onNext={handleNextStep} onBack={handlePreviousStep} />;
            case 3:
                return <AddAdditionalInfo onComplete={handleComplete} onBack={handlePreviousStep} />;
            default:
                return null;
        }
    };

    return (
        <>
            <div>
                {renderStep()}
            </div>
        </>
    );
};

export default ProfileSetup;
