import React from "react";
import './Main.css';
import { Link } from 'react-router-dom';
import { Col, Row } from "react-bootstrap";

const MainButton = React.memo(({ to, label, ariaLabel }) => (
    <Col>
        <Link to={to} className='link'>
            <button className="btn-main-login" aria-label={ariaLabel}>{label}</button>
        </Link>
    </Col>
));

function Main() {
    return (
        <main className="main-content">
            <div className="central-container">
                <h1>Encontre vagas de emprego</h1>
                <h4>Unimos talento e oportunidade, criando um mundo de possibilidades</h4>
                <Row>
                    <MainButton to='/login' label="Candidato" ariaLabel="Acessar área de candidato" />
                    <MainButton to='/login-empresa' label="Empresa" ariaLabel="Acessar área de empresa" />
                </Row>
            </div>
        </main>
    );
}

export default Main;
