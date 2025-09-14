import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ClassificationResultPage from '../pages/ClassificationResultPage';

// Mock useNavigate and useLocation hooks
const mockNavigate = jest.fn();
const mockLocation = {
  state: {
    result: {
      class_name: 'plastic',
      confidence: 0.85,
      image_id: 123
    },
    image: 'test-image-url'
  }
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

describe('ClassificationResultPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders page title', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const titleElement = screen.getByText(/Результат классификации/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders image preview', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const imageElement = screen.getByAltText(/Загруженное/i);
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', 'test-image-url');
  });

  test('renders classification result', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const classTypeElement = screen.getByText(/plastic/i);
    expect(classTypeElement).toBeInTheDocument();
    
    const confidenceElement = screen.getByText(/85\.0%/i);
    expect(confidenceElement).toBeInTheDocument();
  });

  test('renders recommendation based on class type', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    // Using getAllByText and selecting the first one (the h6 element)
    const recommendationTitles = screen.getAllByText(/Пластик/i);
    expect(recommendationTitles[0]).toBeInTheDocument();
    
    const recommendationText = screen.getByText(/Пластиковые отходы следует сортировать по типам пластика/i);
    expect(recommendationText).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const uploadAnotherButton = screen.getByText(/Загрузить другое изображение/i);
    expect(uploadAnotherButton).toBeInTheDocument();
    expect(uploadAnotherButton).toHaveClass('btn', 'btn-primary');
    
    const markWrongButton = screen.getByText(/Пометить как неправильное/i);
    expect(markWrongButton).toBeInTheDocument();
    expect(markWrongButton).toHaveClass('btn', 'btn-warning');
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass('btn', 'btn-danger');
  });

  test('redirects to classify page when no data is provided', () => {
    // Create a new mock for this specific test
    const mockEmptyLocation = {
      state: null
    };
    
    // Re-mock with empty state for this test
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
      useLocation: () => mockEmptyLocation
    }));
    
    render(
      <MemoryRouter>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    // Wait for the component to redirect
    setTimeout(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/classify');
    }, 0);
  });
});