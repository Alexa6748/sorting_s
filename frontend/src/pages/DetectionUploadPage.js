// frontend/src/pages/DetectionUploadPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DetectionUploadPage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Пожалуйста, выберите изображение (JPG, PNG и т.д.)');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Пожалуйста, выберите изображение');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/detect/', {
        method: 'POST',
        body: formData,
        credentials: 'include'
        });
        
        if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`);
        }

      const data = await response.json();
      
      // Перенаправляем на страницу результатов с данными
      navigate('/detect/results', { 
        state: { 
          result: data,
          image: URL.createObjectURL(file)
        } 
      });
    } catch (err) {
      let errorMessage = 'Ошибка при обработке изображения';
        
        if (err.code === 'ECONNABORTED') {
            errorMessage = 'Время ожидания ответа от сервера истекло. Обработка изображения занимает слишком много времени.';
        } else if (err.response) {
            // Сервер ответил с кодом состояния, отличным от 2xx
            errorMessage = `Ошибка ${err.response.status}: `;
            
            if (err.response.data && err.response.data.error) {
            errorMessage += err.response.data.error;
            } else {
            errorMessage += 'Неизвестная ошибка сервера';
            }
        } else if (err.request) {
            // Запрос был сделан, но ответа не получено
            errorMessage = 'Нет ответа от сервера. Проверьте, запущен ли бэкенд.';
        } else {
            // Что-то случилось при настройке запроса
            errorMessage = `Ошибка: ${err.message}`;
        }
        
        setError(errorMessage);
        console.error('Classification error details:', {
            message: err.message,
            code: err.code,
            response: err.response?.data,
            request: err.request
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detection-upload-page">
      <h2>Загрузите изображение для детекции</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="mb-3">
          <label htmlFor="image" className="form-label">
            Выберите изображение:
          </label>
          <input
            type="file"
            id="image"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
          {file && (
            <div className="mt-2">
              <img 
                src={URL.createObjectURL(file)} 
                alt="Preview" 
                className="img-thumbnail" 
                style={{ maxWidth: '200px' }} 
              />
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Обнаруживаем объекты...
            </>
          ) : (
            'Обнаружить объекты'
          )}
        </button>
      </form>
    </div>
  );
};

export default DetectionUploadPage;

