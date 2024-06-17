import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faCheck, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './SenhaInput.css';

const requisitos = [
    { regex: /.{8,}/, label: "No mínimo 8 caracteres" },
    { regex: /\d/, label: "Pelo menos 1 número" },
    { regex: /[a-z]/, label: "Pelo menos 1 letra minúscula (a...z)" },
    { regex: /[^A-Za-z0-9]/, label: "Pelo menos 1 caractere especial (Ex: !, @, #, $, %, ^, &, *)" },
    { regex: /[A-Z]/, label: "Pelo menos 1 letra maiúscula (A...Z)" }
];

const SenhaInput = ({ label, name, value, title, onChange, showRequirements }) => {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [requisitosValidos, setRequisitosValidos] = useState([false, false, false, false, false]);
    const [inputValue, setInputValue] = useState(value || '');

    useEffect(() => {
        const valids = requisitos.map(requisito => requisito.regex.test(value));
        setRequisitosValidos(valids);
    }, [value]);

    const toggleSenhaVisibilidade = () => {
        setMostrarSenha(prevState => !prevState);
    };

    const handleChange = (event) => {
        const { value } = event.target;
        setInputValue(value);
        onChange(event);
    };

    const getClassName = () => {
        let className = 'senha-input__input';
        if (inputValue) {
            className += ' has-value';
        }
        return className;
    };

    return (
        <div>
            <div className="senha-input">
                <input
                    onInput={handleChange}
                    type={mostrarSenha ? "text" : "password"}
                    id={name}
                    name={name}
                    title={title}
                    value={inputValue}
                    onChange={handleChange}
                    className={getClassName()}
                    required
                />
                <label htmlFor={name}>{label}</label>
                <span className="senha-toggle-icone" onClick={toggleSenhaVisibilidade}>
                    <FontAwesomeIcon icon={mostrarSenha ? faEyeSlash : faEye} />
                </span>
            </div>
            {showRequirements && (
                <ul className="listaRequisitos">
                    {requisitos.map((requisito, index) => (
                        <li key={index}>
                            <FontAwesomeIcon icon={requisitosValidos[index] ? faCheck : faCircle} />
                            <span>{requisito.label}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SenhaInput;
