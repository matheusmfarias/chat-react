import React from 'react';
import HeaderCandidato from './HeaderCandidato/HeaderCandidato';
import MainCandidato from './MainCandidato/MainCandidato';
import Carousel from '../Home/Carousel/Carousel';
import Footer from '../Home/Footer/Footer';

const Dashboard = () => {

    return (
        <>
            <HeaderCandidato />
            <MainCandidato />
            <Carousel />
            <Footer />
        </>
    );
};

export default Dashboard;
