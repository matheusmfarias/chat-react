import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import Select from "react-select";

const FiltersModal = ({
    show,
    onClose,
    filters,
    selectedStateFilter,
    setSelectedStateFilter,
    selectedCityFilter,
    setSelectedCityFilter,
    states,
    cities,
    updateFilters,
}) => {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Filtros</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Form.Group className="mb-2">
                            <h5>Tipo</h5>
                            {["Efetivo", "Aprendiz", "Estágio", "Pessoa Jurídica", "Trainee", "Temporário", "Freelancer", "Terceiro"].map((type) => (
                                <Form.Check
                                    type="checkbox"
                                    label={type}
                                    key={type}
                                    value={type}
                                    checked={filters.type.includes(type)}
                                    onChange={(e) => {
                                        const newTypes = e.target.checked
                                            ? [...filters.type, type]
                                            : filters.type.filter((t) => t !== type);
                                        updateFilters({ ...filters, type: newTypes });
                                    }}
                                />
                            ))}
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <h5>Modalidade</h5>
                            {["Presencial", "Híbrido", "Remoto"].map((modality) => (
                                <Form.Check
                                    type="checkbox"
                                    label={modality}
                                    key={modality}
                                    value={modality}
                                    checked={filters.modality.includes(modality)}
                                    onChange={(e) => {
                                        const newModalities = e.target.checked
                                            ? [...filters.modality, modality]
                                            : filters.modality.filter((m) => m !== modality);
                                        updateFilters({ ...filters, modality: newModalities });
                                    }}
                                />
                            ))}
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <h5>Localização</h5>
                            <Select
                                options={states.map((state) => ({
                                    value: state.sigla,
                                    label: state.nome,
                                }))}
                                value={
                                    states
                                        .map((state) => ({ value: state.sigla, label: state.nome }))
                                        .find((option) => option.value === selectedStateFilter) || null
                                }
                                onChange={(selectedOption) => {
                                    const newState = selectedOption?.value || "";
                                    setSelectedStateFilter(newState);
                                    updateFilters({ ...filters, state: newState });
                                }}
                                placeholder="Estado"
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Select
                                options={cities.map((city) => ({
                                    value: city.nome,
                                    label: city.nome,
                                }))}
                                value={
                                    cities
                                        .map((city) => ({ value: city.nome, label: city.nome }))
                                        .find((option) => option.value === selectedCityFilter) || null
                                }
                                onChange={(selectedOption) => {
                                    const newCity = selectedOption?.value || "";
                                    setSelectedCityFilter(newCity);
                                    updateFilters({ ...filters, city: newCity });
                                }}
                                placeholder="Cidade"
                            />
                        </Form.Group>
                        <Form.Group className="d-flex flex-row justify-content-between">
                            <h5>PcD</h5>
                            <Form.Check
                                type="switch"
                                id="pcd-toggle"
                                label=""
                                checked={filters.pcd === "true"}
                                onChange={(e) => {
                                    const newPcd = e.target.checked ? "true" : "";
                                    updateFilters({ ...filters, pcd: newPcd });
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onClose}>
                    Aplicar Filtros
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FiltersModal;
