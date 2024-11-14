import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/images/logo-footer-aci.png';

const Address = () => (
    <ul>
        <li>
            <FontAwesomeIcon icon={faLocationDot} className='footer-icon' aria-hidden="true" />
            <span>Av. Konrad Adenauer, 555, Centro - Panambi/RS - 98280-000</span>
        </li>
    </ul>
);

const ContactInfo = () => (
    <ul>
        <li>
            <FontAwesomeIcon icon={faPhone} className='footer-icon' aria-hidden="true" />
            <span aria-label="Telefone">(55) 3375-9350</span>
        </li>
        <li>
            <FontAwesomeIcon icon={faWhatsapp} className='footer-icon' aria-hidden="true" />
            <span aria-label="WhatsApp">(55) 99212-8613</span>
        </li>
    </ul>
);

function Footer() {
    return (
        <footer className="footer">
            <div className='footer-columns'>
                <div className='logo-footer-container'>
                    <a href='https://acipanambi.com/' target='_blank' rel='noreferrer'>
                        <img src={logo} alt="Logo da ACI Panambi" loading="lazy" />
                    </a>
                </div>
                <Address />
                <ContactInfo />
            </div>
        </footer>
    );
}

export default Footer;