import React from 'react';
import Footer from '../Home/Footer/Footer';

const Layout = ({ children }) => {
  return (
    <div className='app-container'>
      <div className='content'>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
