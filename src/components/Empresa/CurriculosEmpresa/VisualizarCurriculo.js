import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CurriculoTemplate from '../../Candidato/Curriculo/CurriculoTemplate';

const VisualizarCurriculo = () => {
    const { id } = useParams();
    const [informacoes, setInformacoes] = useState({});
    const [experiencias, setExperiencias] = useState([]);
    const [formacoes, setFormacoes] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento

    useEffect(() => {
        const fetchCandidatoInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/user/candidato/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const user = response.data;

                setInformacoes({
                    nome: user.nome,
                    sobrenome: user.sobrenome,
                    dataNascimento: user.nascimento,
                    email: user.email,
                    telefoneContato: user.additionalInfo?.contactPhone || '',
                    telefoneRecado: user.additionalInfo?.backupPhone || '',
                    cnh: user.additionalInfo?.cnh || 'Não tenho',
                    tipoCnh: user.additionalInfo?.cnhTypes || [],
                    fotoPerfil: `http://localhost:5000${user.profilePicture}` || '',
                    habilidadesProfissionais: user.habilidadesProfissionais || [],
                    habilidadesComportamentais: user.habilidadesComportamentais || [],
                    cursos: user.cursos || [],
                    objetivos: user.objetivos || []
                });

                setExperiencias(user.experiences || []);
                setFormacoes(user.formacao || []);
            } catch (error) {
                console.error('Erro ao obter informações do candidato:', error);
            } finally {
                setIsLoading(false); // Finaliza o carregamento
            }
        };

        fetchCandidatoInfo();
    }, [id]);

    // Se ainda está carregando, exibe um spinner
    if (isLoading) {
        return <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Carregando...</span>
        </div>;
    }

    return (
        <div className="curriculo-container">
            <CurriculoTemplate
                experiencias={experiencias}
                formacoes={formacoes}
                informacoes={informacoes}
            />
        </div>
    );
};

export default VisualizarCurriculo;