import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClassificationUploadPage from '../pages/ClassificationUploadPage';

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ClassificationUploadPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders page title', () => {
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    const titleElement = screen.getByText(/Загрузите изображение для классификации/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders file upload area', () => {
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    const dropArea = screen.getByText(/Перетащите изображение сюда или нажмите для выбора/i);
    expect(dropArea).toBeInTheDocument();
    
    // Check for the hidden file input directly
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  test('renders submit button', () => {
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    const submitButton = screen.getByText(/Классифицировать/i);
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveClass('btn', 'btn-primary');
    expect(submitButton).toBeDisabled(); // Should be disabled initially
  });

  test('renders how it works section', () => {
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    const howItWorksTitle = screen.getByText(/Как это работает?/i);
    expect(howItWorksTitle).toBeInTheDocument();
    
    const description = screen.getByText(/Наша система использует нейронную сеть для определения типа отходов на вашем изображении/i);
    expect(description).toBeInTheDocument();
  });
});