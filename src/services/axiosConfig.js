// src/services/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // URL base da sua API
});

api.interceptors.response.use(
  response => response,  // Sucesso, continue normalmente
  error => {
    if (error.response && error.response.status === 401) {
      // Redireciona para a página inicial (ou para login se preferir)
      window.location.href = '/';
      
      // Limpa o token expirado ou inválido
      localStorage.removeItem('token');
    }
    return Promise.reject(error);  // Retorna o erro para ser tratado
  }
);

export default api;
