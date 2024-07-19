import React from 'react';
import { Modal } from 'react-bootstrap';

const ModalComponent = ({ show, handleClose, title, body, footer }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{body}</Modal.Body>
            <Modal.Footer>{footer}</Modal.Footer>
        </Modal>
    );
};

export default ModalComponent;
