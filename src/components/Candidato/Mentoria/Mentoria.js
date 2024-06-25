import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f5f5f5;
  min-height: 80vh;
  padding-top: 80px; /* espaço para o header */
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 3rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5rem;
`;

const Price = styled.p`
  font-size: 1.5rem;
  color: #000;
  font-weight: bold;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  font-size: 1.2rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const Mentoria = () => {
    const navigate = useNavigate();

    const handlePurchase = () => {
        navigate('/mentoria/compra');
    };

    return (
        <div>
            <HeaderCandidato />
            <Container>
                <Card>
                    <Title>Mentoria de Entrevistas e Currículos</Title>
                    <Description>
                        Obtenha orientação de profissionais para se preparar para entrevistas e construir um currículo que se destaque.
                        Melhore suas chances de conseguir o emprego dos seus sonhos com nossas dicas exclusivas e personalizadas.
                    </Description>
                    <Price>R$ 99,99</Price>
                    <Button onClick={handlePurchase}>Comprar Mentoria</Button>
                </Card>
            </Container>
        </div>
    );
};

export default Mentoria;
