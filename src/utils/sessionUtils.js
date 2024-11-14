export const destroySession = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    localStorage.removeItem('role');
};
