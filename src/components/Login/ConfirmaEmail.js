import React from "react";
import logo from '../../assets/images/logo-aci-transparente.png';
import './Login.css';
import { useLocation } from "react-router-dom";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const ConfirmaEmail = () => {
    const location = useLocation();
    const email = location.state?.email || localStorage.getItem('email');

    return (
        <div className="container-login">
            <div className="form-login text-center">
                <div className='logo-container-login'>
                    <a href='/' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <h2>Link de verificação encaminhado!</h2>
                <p>Confira a caixa de entrada do e-mail {email} </p>
                <Card className="bg-light rounded border-0 shadow-sm">
                    <Card.Body>
                        <Card.Text>
                            <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: "4px" }}/>
                            Se não estiver na caixa de entrada, lembre-se de verificar o Spam.
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}

export default ConfirmaEmail;
