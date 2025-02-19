import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilterCircleXmark } from '@fortawesome/free-solid-svg-icons';

const Filters = ({
    filters,
    setFilters,
    selectedStateFilter,
    setSelectedStateFilter,
    selectedCityFilter,
    setSelectedCityFilter,
    states,
    cities,
    hasFiltersApplied,
    handleResetFilter,
    updateFilters,
    setLoading,
}) => {
    return (
        <Col lg={2} className="coluna-filtros mt-2" style={{ position: 'sticky', top: '10px', height: '100%' }}>
            <Row>
                <Col lg={11}>
                    <Form.Group className="mb-2">
                        <div className="d-flex flex-row justify-content-between">
                            <h5>Tipo</h5>
                            {hasFiltersApplied(filters, selectedStateFilter, selectedCityFilter) && (
                                <FontAwesomeIcon
                                    icon={faFilterCircleXmark}
                                    title="Limpar filtros"
                                    onClick={handleResetFilter}
                                    size="lg"
                                    style={{ cursor: 'pointer' }}
                                />
                            )}
                        </div>
                        {['Efetivo', 'Aprendiz', 'Estágio', 'Pessoa Jurídica', 'Trainee', 'Temporário', 'Freelancer', 'Terceiro'].map((type) => (
                            <Form.Check
                                type="checkbox"
                                label={type}
                                key={type}
                                value={type}
                                checked={filters.type.includes(type)}
                                onChange={(e) => {
                                    setLoading(true);
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
                        {['Presencial', 'Híbrido', 'Remoto'].map((modality) => (
                            <Form.Check
                                type="checkbox"
                                label={modality}
                                key={modality}
                                value={modality}
                                checked={filters.modality.includes(modality)}
                                onChange={(e) => {
                                    setLoading(true);
                                    const newModalities = e.target.checked
                                        ? [...filters.modality, modality]
                                        : filters.modality.filter((t) => t !== modality);
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
                                setLoading(true);
                                const newState = selectedOption?.value || "";
                                setSelectedStateFilter(newState);
                                updateFilters({ ...filters, state: newState })
                            }}
                            placeholder="Estado"
                            menuPortalTarget={document.body}
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
                                setLoading(true);
                                const newCity = selectedOption?.value || "";
                                setSelectedCityFilter(newCity);
                                updateFilters({ ...filters, city: newCity });
                            }}
                            placeholder="Cidade"
                            menuPortalTarget={document.body}
                        />
                    </Form.Group>
                    <Form.Group className="d-flex flex-row justify-content-between">
                        <h5>PcD</h5>
                        <Form.Check
                            type="switch"
                            id="pcd-toggle"
                            label=""
                            checked={filters.pcd === 'true'}
                            onChange={(e) => {
                                setLoading(true);
                                const newPcd = e.target.checked ? "true" : "";
                                updateFilters({ ...filters, pcd: newPcd });
                            }}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Col>
    );
};

export default Filters;
