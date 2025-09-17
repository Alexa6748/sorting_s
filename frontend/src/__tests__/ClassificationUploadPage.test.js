import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClassificationUploadPage from '../pages/ClassificationUploadPage';

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock fetch API
global.fetch = jest.fn();

describe('ClassificationUploadPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the URL mocks to return specific values
    global.URL.createObjectURL.mockClear();
    global.URL.createObjectURL.mockReturnValue('mock-url');
    global.URL.revokeObjectURL.mockClear();
    global.fetch.mockClear();
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

  test('allows file selection and shows preview', () => {
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    // Get the file input
    const fileInput = document.querySelector('input[type="file"]');
    
    // Create a mock image file
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check that file is set
    expect(screen.getByText(/test.png/i)).toBeInTheDocument();
    
    // Check that submit button is now enabled
    const submitButton = screen.getByText(/Классифицировать/i);
    expect(submitButton).toBeEnabled();
  });

  test('shows error for invalid file type', () => {
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    // Get the file input
    const fileInput = document.querySelector('input[type="file"]');
    
    // Create a mock text file (invalid type)
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check that error message is displayed
    expect(screen.getByText(/Пожалуйста, выберите изображение \(JPG, PNG и т.д.\)/i)).toBeInTheDocument();
    
    // Check that submit button remains disabled
    const submitButton = screen.getByText(/Классифицировать/i);
    expect(submitButton).toBeDisabled();
  });

  test('allows file removal', () => {
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    // First select a file
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check that file preview is shown
    expect(screen.getByText(/test.png/i)).toBeInTheDocument();
    
    // Click remove button
    const removeButton = screen.getByTitle(/Удалить изображение/i);
    fireEvent.click(removeButton);
    
    // Check that file preview is removed
    expect(screen.queryByText(/test.png/i)).not.toBeInTheDocument();
    
    // Check that submit button is disabled again
    const submitButton = screen.getByText(/Классифицировать/i);
    expect(submitButton).toBeDisabled();
  });

  // test('handles drag and drop of invalid file type', () => {
  //   render(
  //     <BrowserRouter>
  //       <ClassificationUploadPage />
  //     </BrowserRouter>
  //   );
    
  //   // Create a mock text file (invalid type)
  //   const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    
  //   // Get the drop area
  //   const dropArea = document.querySelector('.drop-area');
    
  //   // Simulate drag over
  //   fireEvent.dragOver(dropArea);
    
  //   // Simulate drop with an invalid file type
  //   fireEvent.drop(dropArea, {
  //     dataTransfer: {
  //       files: [file]
  //     }
  //   });
    
  //   // Check that error message is displayed
  //   expect(screen.getByText(/Пожалуйста, перетащите изображение/i)).toBeInTheDocument();
    
  //   // Check that submit button remains disabled
  //   const submitButton = screen.getByText(/Классифицировать/i);
  //   expect(submitButton).toBeDisabled();
  // });

  // test('shows error for drag and drop of invalid file type', () => {
  //   render(
  //     <BrowserRouter>
  //       <ClassificationUploadPage />
  //     </BrowserRouter>
  //   );
    
  //   // Get the file input
  //   const fileInput = document.querySelector('input[type="file"]');
    
  //   // Create a mock text file (invalid type)
  //   const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    
  //   // Simulate file selection (as if dropped)
  //   fireEvent.change(fileInput, { target: { files: [file] } });
    
  //   // Check that error message is displayed by looking for part of the error text
  //   expect(screen.getByText(/Пожалуйста/i)).toBeInTheDocument();
    
  //   // Check that submit button remains disabled
  //   const submitButton = screen.getByText(/Классифицировать/i);
  //   expect(submitButton).toBeDisabled();
  // });

  test('submits form successfully and navigates to result page', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classification: 'plastic', confidence: 0.95 })
    });
    
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    // Select a file first
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Click submit button
    const submitButton = screen.getByText(/Классифицировать/i);
    fireEvent.click(submitButton);
    
    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('shows error message when API returns error', async () => {
    // Mock failed API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error')
    });
    
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    // Select a file first
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Click submit button
    const submitButton = screen.getByText(/Классифицировать/i);
    fireEvent.click(submitButton);
    
    // Wait for error message
    await waitFor(() => {
      // Check for the error message that includes the HTTP error details
      expect(screen.getByText(/Ошибка/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    // Mock API call that takes some time
    global.fetch.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve({ classification: 'plastic', confidence: 0.95 })
        });
      }, 100);
    }));
    
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    // Select a file first
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Click submit button
    const submitButton = screen.getByText(/Классифицировать/i);
    fireEvent.click(submitButton);
    
    // Check that loading state is shown
    expect(screen.getByText(/Обработка/i)).toBeInTheDocument();
    // Check for spinner element with role status
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  test('calls URL.revokeObjectURL when removing file', () => {
    render(
      <BrowserRouter>
        <ClassificationUploadPage />
      </BrowserRouter>
    );
    
    // First select a file
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Verify that URL.createObjectURL was called
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    
    // Click remove button
    const removeButton = screen.getByTitle(/Удалить изображение/i);
    fireEvent.click(removeButton);
    
    // Verify that URL.revokeObjectURL was called with the created URL
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });
});