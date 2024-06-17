import React from "react";
import './MainCandidato.css';
import '../../../styles/global.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

function Main() {
    return (
        <main className="main-content-usuario">
            <div className="central-container-usuario">
                <h1>Encontre vagas de emprego</h1>
                <h4>Unimos talento e oportunidade, criando um mundo de possibilidades</h4>
                <div className="container-busca">
                        <input
                            type="text"
                            className="input-busca"
                            id="busca"
                            name="busca"
                            maxLength="35"
                            placeholder="Busque por oportunidades e empresas"
                        />
                        <button>
                        <FontAwesomeIcon icon={faMagnifyingGlass}  />
                        </button>
                    </div>
            </div>
        </main>
    );
}

export default Main;