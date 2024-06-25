import React from 'react';
import QRCode from 'qrcode.react';
import styled from 'styled-components';
import HeaderCandidato from '../HeaderCandidato/HeaderCandidato';

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
  margin-bottom: 2rem;
`;

const QRCodeWrapper = styled.div`
  margin-bottom: 2rem;
`;

const CompraMentoria = () => {
  const pixKey = "00020126430014BR.GOV.BCB.PIX0114+5511999999995204000053039865802BR5906Fulano6008BRASIL62070503***6304";

  return (
    <div>
      <HeaderCandidato />
      <Container>
        <Card>
          <Title>Pagamento por PIX</Title>
          <Description>
            Para completar a compra, escaneie o QR-code abaixo com seu aplicativo de banco:
          </Description>
          <QRCodeWrapper>
            <QRCode value={pixKey} size={256} />
          </QRCodeWrapper>
        </Card>
      </Container>
    </div>
  );
};

export default CompraMentoria;
