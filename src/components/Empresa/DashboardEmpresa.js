import React from 'react';
import HeaderEmpresa from './HeaderEmpresa';
import MainEmpresa from './MainEmpresa';
import Footer from '../Footer/Footer';
import CarouselEmpresa from './CarouselEmpresa/CarouselEmpresa';

const DashboardEmpresa = () => {

  return (
    <>
      <HeaderEmpresa />
      <MainEmpresa />
      <CarouselEmpresa />
      <Footer />
    </>
  );
};

export default DashboardEmpresa;
