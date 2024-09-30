import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "quill/dist/quill.core.css";
import 'react-quill/dist/quill.snow.css';
import { LoadingProvider } from './context/LoadingContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </React.StrictMode>
);
