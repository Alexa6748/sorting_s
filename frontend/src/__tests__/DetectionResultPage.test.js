import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import DetectionResultPage from '../pages/DetectionResultPage';
import userEvent from '@testing-library/user-event';

// Mock fetch globally
global.fetch = jest.fn();
global.alert = jest.fn(); // Mock alert

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

describe('DetectionResultPage', () => {
  const mockLocationState = {
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
            confidence: 0.65,
            box: [150, 160, 250, 300],
            image_id: 123
          },
          {
            class_name: 'glass',
            confidence: 0.35,
            box: [300, 350, 400, 450],
            image_id: 123
          }
        ],
        processed_image_url: 'test-processed-image-url',
        image_id: 123
      }
    }
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    fetch.mockClear();
    mockNavigate.mockClear();
    global.alert.mockClear();
    mockUseLocation.mockReturnValue(mockLocationState);
  });

  test('renders page title', () => {
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    const titleElement = screen.getByText(/Результаты детекции/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders original and processed images', () => {
    render(
      <MemoryRouter>
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

  test('renders detection results in table format (desktop view)', () => {
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Check for all detections in the table (desktop view)
    const tableRows = screen.getAllByRole('row');
    // We expect at least 4 rows (header + 3 detections)
    expect(tableRows.length).toBeGreaterThanOrEqual(4);
    
    // Check confidence values in the table
    const tableConfidenceElements = screen.getAllByText(/85\.00%|65\.00%|35\.00%/);
    expect(tableConfidenceElements.length).toBeGreaterThanOrEqual(3);
    
    // Check class names in table cells
    const tableCells = screen.getAllByRole('cell');
    const plasticCells = tableCells.filter(cell => cell.textContent.includes('plastic'));
    const paperCells = tableCells.filter(cell => cell.textContent.includes('paper'));
    const glassCells = tableCells.filter(cell => cell.textContent.includes('glass'));
    
    expect(plasticCells.length).toBeGreaterThan(0);
    expect(paperCells.length).toBeGreaterThan(0);
    expect(glassCells.length).toBeGreaterThan(0);
    
    // Check coordinates in the table
    const coordinateElements = screen.getAllByText(/\(10, 20\)|\(150, 160\)|\(300, 350\)/);
    expect(coordinateElements.length).toBeGreaterThanOrEqual(3);
  });

  test('renders action buttons', () => {
    render(
      <MemoryRouter>
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
    // Mock useLocation to return null state
    mockUseLocation.mockReturnValue({ state: null });
    
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/detect');
  });

  test('redirects to detection page when no image is provided', () => {
    // Mock useLocation to return state without image
    mockUseLocation.mockReturnValue({
      state: {
        image: null,
        result: mockLocationState.state.result
      }
    });
    
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/detect');
  });

  test('redirects to detection page when no detections are present', () => {
    // Mock useLocation to return state with empty detections
    mockUseLocation.mockReturnValue({
      state: {
        image: 'test-original-image-url',
        result: {
          detections: [],
          processed_image_url: 'test-processed-image-url',
          image_id: 123
        }
      }
    });
    
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/detect');
  });

  test('renders confidence badges with correct classes for high confidence', () => {
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Check for high confidence (should have bg-success class)
    // Get all elements with 85.00% and check the first one (table view)
    const highConfidenceBadges = screen.getAllByText(/85\.00%/);
    expect(highConfidenceBadges[0]).toHaveClass('bg-success');
  });

  test('renders confidence badges with correct classes for medium confidence', () => {
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Check for medium confidence (should have bg-warning and text-dark classes)
    // Get all elements with 65.00% and check the first one (table view)
    const mediumConfidenceBadges = screen.getAllByText(/65\.00%/);
    expect(mediumConfidenceBadges[0]).toHaveClass('bg-warning', 'text-dark');
  });

  test('renders confidence badges with correct classes for low confidence', () => {
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Check for low confidence (should have bg-danger class)
    // Get all elements with 35.00% and check the first one (table view)
    const lowConfidenceBadges = screen.getAllByText(/35\.00%/);
    expect(lowConfidenceBadges[0]).toHaveClass('bg-danger');
  });

  test('handles delete button click successfully', async () => {
    // Mock successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('')
    });
    
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    await userEvent.click(deleteButton);
    
    // Check that fetch was called with correct URL and options
    expect(fetch).toHaveBeenCalledWith('/api/detect/123/', {
      method: 'DELETE'
    });
    
    // Check that alert was called with success message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Результаты детекции успешно удалены');
    });
    
    // Check that navigate was called after successful deletion
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/detect');
    });
  });

  test('handles delete button click with error', async () => {
    // Mock failed fetch response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error')
    });
    
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    await userEvent.click(deleteButton);
    
    // Check that fetch was called with correct URL and options
    expect(fetch).toHaveBeenCalledWith('/api/detect/123/', {
      method: 'DELETE'
    });
    
    // Check that alert was called with error message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Ошибка при удалении результатов детекции'));
    });
    
    // Check that navigate was NOT called after failed deletion
    expect(mockNavigate).not.toHaveBeenCalledWith('/detect');
  });

  test('disables delete button during deletion', async () => {
    // Mock fetch that takes some time to resolve
    let resolveFetch;
    fetch.mockImplementationOnce(() => new Promise(resolve => {
      resolveFetch = resolve;
    }));
    
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    
    // Initially button should not be disabled
    expect(deleteButton).not.toBeDisabled();
    
    // Click the button
    await userEvent.click(deleteButton);
    
    // Button should be disabled during deletion
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveTextContent(/Удаление\.\.\./i);
    
    // Resolve the fetch promise
    resolveFetch({ ok: true, text: () => Promise.resolve('') });
  });

  test('conditionally renders processed image', () => {
    // Create a mock without processed_image_url
    const mockNoProcessedImageState = {
      state: {
        image: 'test-original-image-url',
        result: {
          detections: [
            {
              class_name: 'plastic',
              confidence: 0.85,
              box: [10, 20, 100, 200],
              image_id: 123
            }
          ],
          processed_image_url: null,
          image_id: 123
        }
      }
    };
    
    mockUseLocation.mockReturnValue(mockNoProcessedImageState);
    
    render(
      <MemoryRouter>
        <DetectionResultPage />
      </MemoryRouter>
    );
    
    // Original image should be present
    const originalImage = screen.getByAltText(/Uploaded/i);
    expect(originalImage).toBeInTheDocument();
    
    // Processed image should not be present
    const processedImages = screen.queryAllByAltText(/Processed/i);
    expect(processedImages.length).toBe(0);
  });
});