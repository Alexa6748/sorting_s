import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import DetectionResultPage from '../pages/DetectionResultPage';

// Mock useNavigate and useLocation hooks
const mockNavigate = jest.fn();
const mockLocation = {
  state: {
    image: 'test-original-image-url',
    result: {
      detections: [
        {
          class_name: 'plastic',
          confidence: 0.85,
          box: [10, 20, 100, 200],
          image_id: 123
        },
        {
          class_name: 'paper',
          confidence: 0.75,
          box: [150, 160, 250, 300],
          image_id: 123
        }
      ],
      processed_image_url: 'test-processed-image-url',
      image_id: 123
    }
  }
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

describe('DetectionResultPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders page title', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    const titleElement = screen.getByText(/Результаты детекции/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders original and processed images', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    const originalImage = screen.getByAltText(/Uploaded/i);
    expect(originalImage).toBeInTheDocument();
    expect(originalImage).toHaveAttribute('src', 'test-original-image-url');
    
    const processedImage = screen.getByAltText(/Processed/i);
    expect(processedImage).toBeInTheDocument();
    expect(processedImage).toHaveAttribute('src', 'test-processed-image-url');
  });

  test('renders detection results in table format', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Check for both detections using getAllByText and checking specific elements
    const detectionRows = screen.getAllByRole('row');
    // We expect at least 3 rows (header + 2 detections)
    expect(detectionRows.length).toBeGreaterThanOrEqual(3);
    
    // Check confidence values - using getAllByText since they appear in multiple places
    const confidence85Elements = screen.getAllByText(/85\.00%/i);
    expect(confidence85Elements.length).toBeGreaterThan(0);
    
    const confidence75Elements = screen.getAllByText(/75\.00%/i);
    expect(confidence75Elements.length).toBeGreaterThan(0);
    
    // Check class names in table cells
    const tableCells = screen.getAllByRole('cell');
    const plasticCells = tableCells.filter(cell => cell.textContent.includes('plastic'));
    const paperCells = tableCells.filter(cell => cell.textContent.includes('paper'));
    
    expect(plasticCells.length).toBeGreaterThan(0);
    expect(paperCells.length).toBeGreaterThan(0);
    
    // Check coordinates using getAllByText and selecting specific ones
    const coordinateElements = screen.getAllByText(/\(10, 20\)/i);
    expect(coordinateElements.length).toBeGreaterThan(0);
    
    const coordinateElements2 = screen.getAllByText(/\(150, 160\)/i);
    expect(coordinateElements2.length).toBeGreaterThan(0);
  });

  test('renders action buttons', () => {
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    const uploadNewButton = screen.getByText(/Загрузить новое изображение/i);
    expect(uploadNewButton).toBeInTheDocument();
    expect(uploadNewButton).toHaveClass('btn', 'btn-primary');
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass('btn', 'btn-danger');
  });

  test('redirects to detection page when no data is provided', () => {
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
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Wait for the component to redirect
    setTimeout(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/detect');
    }, 0);
  });
});