import React, { useEffect } from 'react';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

const CurriculoTemplate = ({ experiencias = [], formacoes = [], informacoes = {} }) => {
    const { nome, sobrenome, dataNascimento, email, telefoneContato, telefoneRecado, cnh, tipoCnh, fotoPerfil, habilidadesProfissionais = [], habilidadesComportamentais = [], cursos = [], objetivos = [] } = informacoes;

    useEffect(() => {
        // Adiciona o CSS à nova janela
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `${window.location.origin}/CurriculoTemplate.css`;
        document.head.appendChild(link);

        // Cleanup para remover o CSS ao desmontar o componente
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    return (
        <Container>
            <Row className="mb-3 mt-2">
                <Col md={3} lg={2}>
                    {fotoPerfil && fotoPerfil !== "undefined" && fotoPerfil !== "" && fotoPerfil !== `${process.env.REACT_APP_API_URL}` ? (
                        <Image src={fotoPerfil} className="profile-avatar" />
                    ) : (
                        <FontAwesomeIcon
                            icon={faCircleUser}
                            className="profile-avatar"
                            alt="Sem foto"
                            size="6x" // Ajuste o tamanho do ícone conforme necessário
                        />
                    )}
                </Col>
                <Col className="mt-2">
                    <h2>{nome} {sobrenome}</h2>
                    <p><strong>Data de Nascimento:</strong> {formatarData(dataNascimento)}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Telefone de contato:</strong> {telefoneContato}</p>
                    <p><strong>Telefone de recado:</strong> {telefoneRecado}</p>
                    <p><strong>CNH:</strong> {formatarCNH(cnh, tipoCnh)}</p>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Histórico de trabalho</Card.Title>
                            {experiencias.length > 0 ? (
                                <ul>
                                    {experiencias.map((trabalho, index) => {
                                        // Verifica campos faltantes
                                        const camposFaltantes = [];
                                        if (!trabalho.empresa) camposFaltantes.push("empresa");
                                        if (!trabalho.funcao) camposFaltantes.push("função");
                                        if (!trabalho.mesInicial || !trabalho.anoInicial) camposFaltantes.push("período inicial");
                                        if (!trabalho.trabalhoAtualmente && (!trabalho.mesFinal || !trabalho.anoFinal)) camposFaltantes.push("período final");
                                        if (!trabalho.atividades) camposFaltantes.push("atividades");

                                        return (
                                            <li key={index}>
                                                <span style={!trabalho.empresa ? { color: 'red' } : {}}>
                                                    {trabalho.empresa || "Empresa não informada"}
                                                </span> -{' '}
                                                <span style={!trabalho.funcao ? { color: 'red' } : {}}>
                                                    {trabalho.funcao || "Função não informada"}
                                                </span> (
                                                <span style={!trabalho.mesInicial || !trabalho.anoInicial ? { color: 'red' } : {}}>
                                                    {trabalho.mesInicial && trabalho.anoInicial
                                                        ? `${trabalho.mesInicial}/${trabalho.anoInicial}`
                                                        : "Período inicial não informado"
                                                    }
                                                </span> -{' '}
                                                <span style={!trabalho.trabalhoAtualmente && (!trabalho.mesFinal || !trabalho.anoFinal) ? { color: 'red' } : {}}>
                                                    {trabalho.trabalhoAtualmente
                                                        ? 'Atualmente'
                                                        : (trabalho.mesFinal && trabalho.anoFinal
                                                            ? `${trabalho.mesFinal}/${trabalho.anoFinal}`
                                                            : "Período final não informado"
                                                        )}
                                                </span>) -{' '}
                                                <span style={!trabalho.atividades ? { color: 'red' } : {}}>
                                                    {trabalho.atividades || "Atividades não informadas"}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p>Nenhuma informação inserida</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Histórico escolar</Card.Title>
                            {formacoes.length > 0 ? (
                                <ul>
                                    {formacoes.map((escola, index) => (
                                        <li key={index}>
                                            {escola.instituicao} - {escola.escolaridade}
                                            {escola.escolaridade === 'Superior' && escola.grau ? ` (${escola.grau})` : ''} - {escola.curso} ({escola.situacao})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhuma informação inserida</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Habilidades profissionais</Card.Title>
                            {habilidadesProfissionais.length > 0 ? (
                                <ul>
                                    {habilidadesProfissionais.map((habilidade, index) => (
                                        <li key={index}>{habilidade}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhuma informação inserida</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Habilidades comportamentais</Card.Title>
                            {habilidadesComportamentais.length > 0 ? (
                                <ul>
                                    {habilidadesComportamentais.map((habilidade, index) => (
                                        <li key={index}>{habilidade}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhuma informação inserida</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Cursos e qualificações</Card.Title>
                            {cursos.length > 0 ? (
                                <ul>
                                    {cursos.map((curso, index) => (
                                        <li key={index}>{curso}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhuma informação inserida</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Objetivos</Card.Title>
                            {objetivos.length > 0 ? (
                                <ul>
                                    {objetivos.map((objetivo, index) => (
                                        <li key={index}>{objetivo}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhuma informação inserida</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CurriculoTemplate;

// Função para formatar a data no formato dia/mês/ano
const formatarData = (data) => {
    const date = new Date(data);
    const dia = String(date.getUTCDate()).padStart(2, '0');
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const ano = date.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
};


// Função para formatar a CNH
const formatarCNH = (cnh, cnhTypes) => {
    if (cnh === 'Não tenho') {
        return 'Não';
    }

    // Filtra o array para garantir que só tipos válidos sejam exibidos
    const tiposValidos = (cnhTypes || []).filter(type => type.trim() !== '');

    if (tiposValidos.length > 0) {
        return `${tiposValidos.join(', ')}`; // Exibe os tipos de CNH, se existirem
    }

    return 'Tem';
};