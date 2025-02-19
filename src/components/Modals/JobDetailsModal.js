import React from "react";
import { Modal, Card, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWheelchair, faLocationDot, faHome, faBuilding, faLaptopHouse, faBriefcase, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import Skeleton from "react-loading-skeleton";

const JobDetailsModal = ({
    show,
    onClose,
    jobDetails,
    loading,
    onSubmit,
    submitting,
}) => {
    return (
        <Modal show={show} onHide={onClose} centered dialogClassName="modal-dialog-scrollable">
            <Modal.Header closeButton>
                <Modal.Title>Detalhes da vaga</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <Card className="border-0">
                    <Card.Body>
                        {loading ? (
                            <>
                                <Skeleton height={20} width="80%" className="mb-2" />
                                <Skeleton height={20} width="40%" className="mb-3" />
                                <Skeleton height={20} width="70%" className="mb-2" />
                                <Skeleton height={20} width="50%" className="mb-2" />
                                <Skeleton height={20} width="60%" className="mb-2" />
                                <Skeleton height={20} width="70%" className="mb-3" />
                                <Skeleton height={20} width="90%" className="mb-3" />
                            </>
                        ) : jobDetails ? (
                            <>
                                <div className="d-flex flex-row align-items-center">
                                    <Card.Title className="mb-0 me-2 info-card fs-5">{jobDetails.title}</Card.Title>
                                    {jobDetails.pcd && (
                                        <FontAwesomeIcon icon={faWheelchair} title="PcD" className="text-primary" />
                                    )}
                                </div>
                                <Card.Text className="mt-2 info-card">
                                    {jobDetails.identifyCompany
                                        ? "Empresa confidencial"
                                        : jobDetails.company
                                            ? jobDetails.company.nome
                                            : "Empresa não informada"}
                                </Card.Text>
                                <Card.Text className="mt-2 info-card">
                                    <FontAwesomeIcon className="me-2" icon={faLocationDot} title="Localização" />
                                    {jobDetails.city}, {jobDetails.state}
                                </Card.Text>
                                <Card.Text className="info-card">
                                    <FontAwesomeIcon
                                        className="me-2"
                                        icon={
                                            jobDetails.modality === "Remoto"
                                                ? faHome
                                                : jobDetails.modality === "Presencial"
                                                    ? faBuilding
                                                    : faLaptopHouse
                                        }
                                        title="Modelo"
                                    />
                                    {jobDetails.modality}
                                </Card.Text>
                                <Card.Text className="info-card">
                                    <FontAwesomeIcon className="me-2" icon={faBriefcase} title="Tipo" />
                                    {jobDetails.type}
                                </Card.Text>
                                <Card.Text className="info-card">
                                    <FontAwesomeIcon className="me-2" icon={faMoneyBillWave} title="Salário" />
                                    {jobDetails.salary ? jobDetails.salary : "A combinar"}
                                </Card.Text>
                                {jobDetails.offers && (
                                    <>
                                        <Card.Title>Benefícios</Card.Title>
                                        <Card.Text dangerouslySetInnerHTML={{ __html: jobDetails.offers }} />
                                    </>
                                )}
                                {jobDetails.description && (
                                    <>
                                        <Card.Title>Descrição</Card.Title>
                                        <Card.Text dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
                                    </>
                                )}
                                {jobDetails.responsibilities && (
                                    <>
                                        <Card.Title>Responsabilidades e atribuições</Card.Title>
                                        <Card.Text dangerouslySetInnerHTML={{ __html: jobDetails.responsibilities }} />
                                    </>
                                )}
                                {jobDetails.qualifications && (
                                    <>
                                        <Card.Title>Requisitos e qualificações</Card.Title>
                                        <Card.Text dangerouslySetInnerHTML={{ __html: jobDetails.qualifications }} />
                                    </>
                                )}
                                {jobDetails.requiriments && (
                                    <>
                                        <Card.Title>Será um diferencial</Card.Title>
                                        <Card.Text dangerouslySetInnerHTML={{ __html: jobDetails.requiriments }} />
                                    </>
                                )}
                                {jobDetails.additionalInfo && (
                                    <>
                                        <Card.Title>Informações adicionais</Card.Title>
                                        <Card.Text dangerouslySetInnerHTML={{ __html: jobDetails.additionalInfo }} />
                                    </>
                                )}
                                {!jobDetails.offers &&
                                    !jobDetails.description &&
                                    !jobDetails.responsibilities &&
                                    !jobDetails.qualifications &&
                                    !jobDetails.requiriments &&
                                    !jobDetails.additionalInfo && (
                                        <Card.Text>Nenhuma informação adicional informada.</Card.Text>
                                    )}
                            </>
                        ) : (
                            <p>Carregando detalhes...</p>
                        )}
                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer>
                {onSubmit && (
                    <Button onClick={onSubmit} style={{ minWidth: "166px" }}>
                        {submitting ? (
                            <div className="d-flex justify-content-center align-items-center">
                                <Spinner animation="border" />
                            </div>
                        ) : (
                            <span>Enviar currículo</span>
                        )}
                    </Button>
                )}
                <Button variant="secondary" onClick={onClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default JobDetailsModal;
