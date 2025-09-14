// frontend/src/pages/ClassificationUploadPage.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ClassificationUploadPage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Очищаем предыдущий URL объекта
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Проверяем, что файл - изображение
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        // Создаем URL для предварительного просмотра
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        setError('');
      } else {
        setError('Пожалуйста, выберите изображение (JPG, PNG и т.д.)');
        setFile(null);
        setPreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFile(file);
        // Создаем URL для предварительного просмотра
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setError('');
        
        // Очищаем input
        if (fileInputRef.current) {
          fileInputRef.current.files = e.dataTransfer.files;
        }
      } else {
        setError('Пожалуйста, перетащите изображение');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    
    // Очищаем URL объекта
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        
        const response = await fetch('/api/classify/', {
        method: 'POST',
        body: formData,
        credentials: 'include'
        });
        
        if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`);
        }
        
        const data = await response.json();
        
        navigate('/classify/result', { 
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
    <div className="classification-upload-page">
      <h2 className="mb-4">Загрузите изображение для классификации</h2>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div 
        className="upload-container"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="mb-4">
            <label className="form-label">Выберите изображение:</label>
            
            {/* Область для перетаскивания */}
            <div 
              className={`drop-area ${file ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current.click()}
              style={{ 
                cursor: 'pointer',
                border: '2px dashed #ced4da',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                transition: 'all 0.3s'
              }}
            >
              {!file ? (
                <div>
                  <i className="bi bi-cloud-arrow-up" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                  <p className="mt-2">Перетащите изображение сюда или нажмите для выбора</p>
                  <small className="text-muted">Поддерживаемые форматы: JPG, PNG, GIF</small>
                </div>
              ) : (
                <div className="preview-container" style={{ position: 'relative' }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="img-fluid rounded" 
                    style={{ 
                      maxHeight: '300px', 
                      width: 'auto',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute"
                    style={{ top: '10px', right: '10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    title="Удалить изображение"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                  <p className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100"
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Обработка...
              </>
            ) : (
              'Классифицировать'
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-4">
        <div className="alert alert-info">
          <h5 className="alert-heading">Как это работает?</h5>
          <p>Наша система использует нейронную сеть для определения типа отходов на вашем изображении.</p>
          <hr />
          <p className="mb-0">Для лучшего результата загружайте четкие изображения с хорошо видимыми объектами.</p>
        </div>
      </div>
    </div>
  );
};

export default ClassificationUploadPage;