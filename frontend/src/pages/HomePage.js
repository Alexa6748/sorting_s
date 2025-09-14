// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Добро пожаловать в сервис по классификации и детекции отходов</h1>
      <p>Выберите тип анализа для загруженного изображения:</p>
      
      <div className="analysis-options mt-5">
        <div className="card mb-4">
          <div className="card-body text-center p-4">
            <h3 className="card-title">Классификация</h3>
            <p className="card-text">Определение типа отходов на изображении</p>
            <Link to="/classify" className="btn btn-primary btn-lg">
              Начать классификацию
            </Link>
          </div>
        </div>
        
        <div className="card mb-4">
          <div className="card-body text-center p-4">
            <h3 className="card-title">Детекция</h3>
            <p className="card-text">Обнаружение и выделение объектов отходов на изображении</p>
            <Link to="/detect" className="btn btn-success btn-lg">
              Начать детекцию
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-muted">
          Оба сервиса используют современные нейронные сети для анализа изображений.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
