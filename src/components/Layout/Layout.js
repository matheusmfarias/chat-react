import React from 'react';
import Footer from '../Footer/Footer';

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
