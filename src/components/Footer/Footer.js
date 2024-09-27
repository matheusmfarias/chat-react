import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/logo-footer-aci.png';
import '../../styles/global.css';

function Footer() {
    return (
        <>
            <footer className="footer">
                <div className='logo-footer-container'>
                    <a href='https://acipanambi.com/' target='_blank' rel='noreferrer'><img src={logo} alt="Logo" loading="lazy" /></a>
                </div>
                <div className='footer-columns'>
                    <ul>
                        <li><FontAwesomeIcon icon={faLocationDot} className='footer-icon' />Av. Konrad Adenauer, 555, Centro - Panambi/RS - 98280-000</li>
                    </ul>
                    <ul>
                        <li><FontAwesomeIcon icon={faPhone} className='footer-icon' />(55) 3375-9350</li>
                        <li><FontAwesomeIcon icon={faWhatsapp} className='footer-icon' />(55) 99212-8613</li>
                    </ul>
                </div>
            </footer>
        </>
    );
}

export default Footer;
