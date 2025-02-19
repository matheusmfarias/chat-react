import React, { useEffect, useState } from 'react'; // Adicione o useState
import { createRoot } from 'react-dom/client';
import CurriculoTemplate from './CurriculoTemplate';
import api from '../../../services/axiosConfig';
import { Spinner } from 'react-bootstrap';

const VisualizarCurriculo = ({ userId, onClose }) => {
    const [loading, setLoading] = useState(true); // Estado para controlar o loading

    useEffect(() => {
        if (!userId) {
            console.error("ID do usuário não definido.");
            return;
        }

        const newWindow = window.open('', '_blank', 'width=1024,height=768');
        if (!newWindow) {
            console.error("Não foi possível abrir a nova janela. Verifique se pop-ups estão bloqueados.");
            return;
        }

        newWindow.document.write(`
            <html>
                <head>
                    <title>Currículo</title>
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
                    <link rel="stylesheet" href="${window.location.origin}/CurriculoTemplate.css">
                </head>
                <body>
                    <div id="curriculo-template-root"></div>
                </body>
            </html>
        `);
        newWindow.document.close();

        const fetchAndRenderCurriculo = async () => {
            try {
                setLoading(true); // Ativa o loading antes de buscar os dados
                const token = localStorage.getItem('token');
                const response = await api.get(`${process.env.REACT_APP_API_URL}/api/user/candidato/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const user = response.data;

                newWindow.document.title = `Currículo de ${user.nome} ${user.sobrenome}`;

                const informacoes = {
                    nome: user.nome,
                    sobrenome: user.sobrenome,
                    dataNascimento: user.nascimento ? user.nascimento.split('T')[0] : '',
                    email: user.email,
                    telefoneContato: user.additionalInfo?.contactPhone || '',
                    telefoneRecado: user.additionalInfo?.backupPhone || '',
                    cnh: user.additionalInfo?.cnh || 'Não tenho',
                    tipoCnh: user.additionalInfo?.cnhTypes || [],
                    fotoPerfil: `${process.env.REACT_APP_API_URL}${user.profilePicture}` || '',
                    habilidadesProfissionais: user.habilidadesProfissionais || [],
                    habilidadesComportamentais: user.habilidadesComportamentais || [],
                    cursos: user.cursos || [],
                    objetivos: user.objetivos || []
                };

                const experiencias = user.experiences || [];
                const formacoes = user.formacao || [];

                const rootElement = newWindow.document.getElementById('curriculo-template-root');
                if (rootElement) {
                    const root = createRoot(rootElement);
                    root.render(
                        <CurriculoTemplate
                            experiencias={experiencias}
                            formacoes={formacoes}
                            informacoes={informacoes}
                        />
                    );
                }
            } catch (error) {
                console.error('Erro ao obter informações do usuário:', error);
                newWindow.close();
            } finally {
                setLoading(false); // Desativa o loading após a busca dos dados (ou em caso de erro)
            }
        };

        newWindow.onload = fetchAndRenderCurriculo;

        // Fecha a janela e reseta o estado quando a nova janela é fechada
        const checkWindowClosed = setInterval(() => {
            if (newWindow.closed) {
                clearInterval(checkWindowClosed);
                onClose(); // Reseta o estado no componente pai
            }
        }, 500);

        return () => {
            clearInterval(checkWindowClosed);
        };
    }, [userId, onClose]); // Dependências: userId e onClose

    return (
        <>
            {loading && ( // Exibe o Spinner enquanto os dados estão sendo carregados
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fundo semi-transparente
                    zIndex: 1000 // Garante que o Spinner fique acima de outros elementos
                }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </Spinner>
                </div>
            )}
        </>
    );
};

export default VisualizarCurriculo;