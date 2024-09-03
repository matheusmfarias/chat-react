import React from "react";
import HeaderCandidato from "../HeaderCandidato/HeaderCandidato";
import { useLocation } from 'react-router-dom';

const BuscarVagas = () => {
    const location = useLocation();
    const results = location.state?.results;

    return (
        <>
            <HeaderCandidato />
            <h1>Buscar Vagas</h1>
            <div>
                {results && results.map(result => (
                    <div key={result._id} className="vaga-card">
                        <h3>{result.title}</h3>
                        <p><strong>Localização:</strong> {result.location}</p>
                        <p><strong>Modalidade:</strong> {result.modality}</p>
                        <p><strong>Tipo:</strong> {result.type}</p>
                        <p><strong>Publicação:</strong> {new Date(result.publicationDate).toLocaleDateString()}</p>
                        <p><strong>Descrição:</strong> {result.description}</p>
                        <p><strong>Salário:</strong> {result.salary ? `R$ ${result.salary}` : "Não informado"}</p>
                        <p><strong>PCD:</strong> {result.pcd ? "Sim" : "Não"}</p>
                        <p><strong>Visível:</strong> {result.identifyCompany ? "Sim" : "Não"}</p>

                        {result.identifyCompany && result.company && (
                            <p><strong>Empresa:</strong> {result.company.nome}</p>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}

export default BuscarVagas;
