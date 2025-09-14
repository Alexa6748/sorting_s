import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';

describe('HomePage', () => {
  test('renders welcome message', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    const welcomeElement = screen.getByText(/Добро пожаловать в сервис по классификации и детекции отходов/i);
    expect(welcomeElement).toBeInTheDocument();
  });

  test('renders classification option with link', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    const classificationTitle = screen.getByText(/Классификация/i);
    expect(classificationTitle).toBeInTheDocument();
    
    const classificationLink = screen.getByText(/Начать классификацию/i);
    expect(classificationLink).toBeInTheDocument();
    expect(classificationLink).toHaveAttribute('href', '/classify');
    expect(classificationLink).toHaveClass('btn', 'btn-primary');
  });

  test('renders detection option with link', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    const detectionTitle = screen.getByText(/Детекция/i);
    expect(detectionTitle).toBeInTheDocument();
    
    const detectionLink = screen.getByText(/Начать детекцию/i);
    expect(detectionLink).toBeInTheDocument();
    expect(detectionLink).toHaveAttribute('href', '/detect');
    expect(detectionLink).toHaveClass('btn', 'btn-success');
  });

  test('renders information text', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    const infoElement = screen.getByText(/Оба сервиса используют современные нейронные сети для анализа изображений/i);
    expect(infoElement).toBeInTheDocument();
  });
});