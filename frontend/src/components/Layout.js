// frontend/src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom'; // Заменяет блок main_content в Django

const Layout = () => {
  return (
    <div className="app-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">
            WasteSorter
          </a>
        </div>
      </nav>
      
      <div className="container mt-4">
        {/* Outlet заменяет {% block main_content %}{% endblock %} */}
        <Outlet />
      </div>
      
      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          &copy; 2025 Система автоматической сортировки мусора
        </div>
      </footer>
      
      {/* Подключение Bootstrap (лучше сделать в index.html) */}
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
        async 
      ></script>
    </div>
  );
};

export default Layout;