import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ClassificationResultPage from '../pages/ClassificationResultPage';

// Mock useNavigate
const mockNavigate = jest.fn();

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

// Mock console.error
console.error = jest.fn();

// Mock useLocation for individual tests
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ClassificationResultPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
    mockNavigate.mockClear();
    global.alert.mockClear();
    console.error.mockClear();
  });

  test('renders page title', () => {
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const titleElement = screen.getByText(/Результат классификации/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders image preview', () => {
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const classTypeElement = screen.getByText(/plastic/i);
    expect(classTypeElement).toBeInTheDocument();
    
    const confidenceElement = screen.getByText(/Высокая уверенность \(85\.0%\)/i);
    expect(confidenceElement).toBeInTheDocument();
  });

  test('renders recommendation based on class type', () => {
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
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
    const mockEmptyLocation = {
      state: null
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockEmptyLocation);
    
    render(
      <MemoryRouter>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/classify');
  });

  // Tests for different confidence levels
  test('displays high confidence styling for confidence > 0.7', () => {
    const highConfidenceLocation = {
      state: {
        result: {
          class_name: 'plastic',
          confidence: 0.85,
          image_id: 123
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(highConfidenceLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: highConfidenceLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const confidenceBadge = screen.getByText(/Высокая уверенность/i);
    expect(confidenceBadge).toBeInTheDocument();
    
    const progressBar = document.querySelector('.progress-bar');
    expect(progressBar).toHaveClass('bg-success');
  });

  test('displays medium confidence styling for 0.4 < confidence <= 0.7', () => {
    const mediumConfidenceLocation = {
      state: {
        result: {
          class_name: 'glass',
          confidence: 0.6,
          image_id: 123
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mediumConfidenceLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mediumConfidenceLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const confidenceBadge = screen.getByText(/Средняя уверенность/i);
    expect(confidenceBadge).toBeInTheDocument();
    
    const progressBar = document.querySelector('.progress-bar');
    expect(progressBar).toHaveClass('bg-warning');
    expect(progressBar).toHaveClass('text-dark');
  });

  test('displays low confidence styling for confidence <= 0.4', () => {
    const lowConfidenceLocation = {
      state: {
        result: {
          class_name: 'trash',
          confidence: 0.3,
          image_id: 123
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(lowConfidenceLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: lowConfidenceLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const confidenceBadge = screen.getByText(/Низкая уверенность/i);
    expect(confidenceBadge).toBeInTheDocument();
    
    const progressBar = document.querySelector('.progress-bar');
    expect(progressBar).toHaveClass('bg-danger');
  });

  // Tests for different classification types
  test('renders glass recommendation', () => {
    const glassLocation = {
      state: {
        result: {
          class_name: 'glass',
          confidence: 0.85,
          image_id: 123
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(glassLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: glassLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const recommendationTitle = screen.getByRole('heading', { name: /Стекло/i });
    expect(recommendationTitle).toBeInTheDocument();
    
    const recommendationText = screen.getByText(/Стеклянная тара должна быть чистой и снятой крышкой/i);
    expect(recommendationText).toBeInTheDocument();
  });

  test('renders metal recommendation', () => {
    const metalLocation = {
      state: {
        result: {
          class_name: 'metal',
          confidence: 0.85,
          image_id: 123
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(metalLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: metalLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const recommendationTitle = screen.getByRole('heading', { name: /Металл/i });
    expect(recommendationTitle).toBeInTheDocument();
    
    const recommendationText = screen.getByText(/Металлические банки и упаковку следует промыть и сплющить/i);
    expect(recommendationText).toBeInTheDocument();
  });

  test('renders paper recommendation', () => {
    const paperLocation = {
      state: {
        result: {
          class_name: 'paper',
          confidence: 0.85,
          image_id: 123
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(paperLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: paperLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const recommendationTitle = screen.getByRole('heading', { name: /Бумага/i });
    expect(recommendationTitle).toBeInTheDocument();
    
    const recommendationText = screen.getByText(/Бумажные отходы должны быть сухими и чистыми/i);
    expect(recommendationText).toBeInTheDocument();
  });

  test('renders cardboard recommendation', () => {
    const cardboardLocation = {
      state: {
        result: {
          class_name: 'cardboard',
          confidence: 0.85,
          image_id: 123
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(cardboardLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: cardboardLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const recommendationTitle = screen.getByRole('heading', { name: /Картон/i });
    expect(recommendationTitle).toBeInTheDocument();
    
    const recommendationText = screen.getByText(/Картон следует сложить и упаковать в компактный блок/i);
    expect(recommendationText).toBeInTheDocument();
  });

  test('renders trash recommendation', () => {
    const trashLocation = {
      state: {
        result: {
          class_name: 'trash',
          confidence: 0.85,
          image_id: 123
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(trashLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: trashLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const recommendationTitle = screen.getByRole('heading', { name: /Смешанные отходы/i });
    expect(recommendationTitle).toBeInTheDocument();
    
    const recommendationText = screen.getByText(/К сожалению, система не смогла определить тип отходов/i);
    expect(recommendationText).toBeInTheDocument();
  });

  // Test delete functionality
  test('handles successful delete', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('')
    });
    
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/classify/123/', {
        method: 'DELETE'
      });
    });
    
    // Check that alert was called
    expect(global.alert).toHaveBeenCalledWith('Результаты классификации успешно удалены');
    
    // Check that navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/classify');
  });

  test('handles delete error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error')
    });
    
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    expect(global.alert).toHaveBeenCalledWith(
      'Ошибка при удалении результатов классификации: HTTP error! status: 500, body: Internal Server Error'
    );
  });

  test('handles delete with missing image_id', async () => {
    const noIdLocation = {
      state: {
        result: {
          class_name: 'plastic',
          confidence: 0.85
          // No image_id
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(noIdLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: noIdLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    expect(global.alert).toHaveBeenCalledWith(
      'Ошибка при удалении результатов классификации: ID изображения не найден в ответе API'
    );
  });

  // Test mark as wrong functionality
  test('handles successful mark as wrong', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('')
    });
    
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const markWrongButton = screen.getByText(/Пометить как неправильное/i);
    fireEvent.click(markWrongButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/classify/123/', {
        method: 'PUT',
        body: expect.any(FormData),
        credentials: 'include'
      });
    });
    
    // Check that alert was called
    expect(global.alert).toHaveBeenCalledWith('Классификация помечена как неправильная');
  });

  test('handles mark as wrong error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error')
    });
    
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const markWrongButton = screen.getByText(/Пометить как неправильное/i);
    fireEvent.click(markWrongButton);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    expect(global.alert).toHaveBeenCalledWith(
      'Ошибка при обновлении классификации: HTTP error! status: 500, body: Internal Server Error'
    );
  });

  test('handles mark as wrong with missing image_id', async () => {
    const noIdLocation = {
      state: {
        result: {
          class_name: 'plastic',
          confidence: 0.85
          // No image_id
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(noIdLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: noIdLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const markWrongButton = screen.getByText(/Пометить как неправильное/i);
    fireEvent.click(markWrongButton);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    expect(global.alert).toHaveBeenCalledWith(
      'Ошибка при обновлении классификации: ID изображения не найден в ответе API'
    );
  });

  // Test loading states
  test('shows loading state during delete operation', async () => {
    // Mock a delayed response
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({ ok: true, text: () => Promise.resolve('') }), 
        100)
      )
    );
    
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByText(/Удалить результаты/i);
    fireEvent.click(deleteButton);
    
    // Check that button is disabled during delete
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveTextContent(/Удаление.../i);
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
    });
  });

  test('shows loading state during mark as wrong operation', async () => {
    // Mock a delayed response
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({ ok: true, text: () => Promise.resolve('') }), 
        100)
      )
    );
    
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const markWrongButton = screen.getByText(/Пометить как неправильное/i);
    fireEvent.click(markWrongButton);
    
    // Check that button is disabled during update
    expect(markWrongButton).toBeDisabled();
    expect(markWrongButton).toHaveTextContent(/Обновление.../i);
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(markWrongButton).not.toBeDisabled();
    });
  });

  // Test isWrong state functionality
  test('renders button correctly when is_wrong is true', () => {
    const wrongLocation = {
      state: {
        result: {
          class_name: 'plastic',
          confidence: 0.85,
          image_id: 123,
          is_wrong: true
        },
        image: 'test-image-url'
      }
    };
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(wrongLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: wrongLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const markWrongButton = screen.getByText(/Помечено как неправильное/i);
    expect(markWrongButton).toHaveClass('btn', 'btn-success');
  });

  // Test button navigation
  test('navigates to classify page when upload another button is clicked', () => {
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
    
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);
    
    render(
      <MemoryRouter initialEntries={[{ state: mockLocation.state }]}>
        <ClassificationResultPage />
      </MemoryRouter>
    );
    
    const uploadAnotherButton = screen.getByText(/Загрузить другое изображение/i);
    fireEvent.click(uploadAnotherButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/classify');
  });
});