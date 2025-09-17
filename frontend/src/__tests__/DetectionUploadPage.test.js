import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DetectionUploadPage from '../pages/DetectionUploadPage';

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('DetectionUploadPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockNavigate.mockClear();
    global.fetch.mockClear();
  });

  test('renders page title', () => {
    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    const titleElement = screen.getByText(/Загрузите изображение для детекции/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders file input', () => {
    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    const fileInput = screen.getByLabelText(/Выберите изображение:/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  test('renders submit button', () => {
    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    const submitButton = screen.getByText(/Обнаружить объекты/i);
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveClass('btn', 'btn-primary');
  });

  test('displays error message for invalid file type', () => {
    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    // Simulate file selection with invalid type
    const fileInput = screen.getByLabelText(/Выберите изображение:/i);
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/Пожалуйста, выберите изображение \(JPG, PNG и т\.д\.\)/i)).toBeInTheDocument();
  });

  test('accepts valid image file', () => {
    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    // Simulate file selection with valid image type
    const fileInput = screen.getByLabelText(/Выберите изображение:/i);
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check that no error is displayed
    expect(screen.queryByText(/Пожалуйста, выберите изображение \(JPG, PNG и т\.д\.\)/i)).not.toBeInTheDocument();
    
    // Check that the file is set (indirectly by checking if the preview is shown)
    expect(screen.getByAltText(/Preview/i)).toBeInTheDocument();
  });

  test('displays image preview when valid file is selected', () => {
    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    // Simulate file selection with valid image type
    const fileInput = screen.getByLabelText(/Выберите изображение:/i);
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check that the preview image is displayed
    const previewImage = screen.getByAltText(/Preview/i);
    expect(previewImage).toBeInTheDocument();
    // We're not checking the src attribute because it's set by URL.createObjectURL which we've mocked
  });

  test('submit button is disabled when no file is selected', () => {
    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    const submitButton = screen.getByText(/Обнаружить объекты/i);
    expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when valid file is selected', () => {
    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    // Simulate file selection with valid image type
    const fileInput = screen.getByLabelText(/Выберите изображение:/i);
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByText(/Обнаружить объекты/i);
    expect(submitButton).not.toBeDisabled();
  });

  

  test('submits form successfully with valid file', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 'detection data' }),
      status: 200
    });

    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    // Simulate file selection
    const fileInput = screen.getByLabelText(/Выберите изображение:/i);
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    const submitButton = screen.getByText(/Обнаружить объекты/i);
    fireEvent.click(submitButton);
    
    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
    
    // Check that navigation was called with the correct arguments
    expect(mockNavigate).toHaveBeenCalledWith('/detect/results', expect.objectContaining({
      state: expect.objectContaining({
        result: { result: 'detection data' }
      })
    }));
  });

  test('shows error when API returns error response', async () => {
    // Mock failed API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Internal Server Error',
      status: 500
    });

    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    // Simulate file selection
    const fileInput = screen.getByLabelText(/Выберите изображение:/i);
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    const submitButton = screen.getByText(/Обнаружить объекты/i);
    fireEvent.click(submitButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Ошибка: HTTP error! status: 500, body: Internal Server Error/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    // Mock API call with delay
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100)
      )
    );

    render(
      <BrowserRouter>
        <DetectionUploadPage />
      </BrowserRouter>
    );
    
    // Simulate file selection
    const fileInput = screen.getByLabelText(/Выберите изображение:/i);
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    const submitButton = screen.getByText(/Обнаружить объекты/i);
    fireEvent.click(submitButton);
    
    // Check loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/Обнаруживаем объекты.../i)).toBeInTheDocument();
    
    // Check that the spinner is present
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/Обнаружить объекты/i)).toBeInTheDocument();
    });
  });
});