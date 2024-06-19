import React from "react";
import './Main.css';
import '../../styles/global.css';
import { Link } from 'react-router-dom';

function Main() {
    return (
        <main className="main-content">
            <div className="central-container">
                <h1>Encontre vagas de emprego</h1>
                <h4>Unimos talento e oportunidade, criando um mundo de possibilidades</h4>
                <Link to='/login' className='link'>
                    <button className="btn-main-login">Entrar</button>
                </Link>
            </div>
        </main>
    );
}

export default Main;