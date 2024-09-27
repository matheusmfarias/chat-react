import React from "react";
import './Main.css';
import '../../styles/global.css';
import { Link } from 'react-router-dom';
import { Col, Row } from "react-bootstrap";

function Main() {
    return (
        <main className="main-content">
            <div className="central-container">
                <h1>Encontre vagas de emprego</h1>
                <h4>Unimos talento e oportunidade, criando um mundo de possibilidades</h4>
                <Row>
                    <Col>
                        <Link to='/login' className='link'>
                            <button className="btn-main-login">Candidato</button>
                        </Link>
                    </Col>
                    <Col>
                        <Link to='/login-empresa' className='link'>
                            <button className="btn-main-login">Empresa</button>
                        </Link>
                    </Col>
                </Row>
            </div>
        </main>
    );
}

export default Main;