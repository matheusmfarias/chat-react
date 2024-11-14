import React, { Suspense } from "react";
import Header from './Header/Header';
import Main from './Main/Main';
import { Spinner } from "react-bootstrap";

const Carousel = React.lazy(() => import('./Carousel/Carousel'));

const Home = () => (
  <>
    <Header />
    <Main />
    <Suspense fallback={<div className="d-flex justify-content-center align-items-center">
      <Spinner animation="border" variant="white" />
    </div>}>
      <Carousel />
    </Suspense>
  </>
);

export default Home;
