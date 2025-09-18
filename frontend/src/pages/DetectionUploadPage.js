// frontend/src/pages/DetectionUploadPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSubmitOperation } from '../utils/deleteUtils';

const DetectionUploadPage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type.startsWith('image/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Пожалуйста, выберите изображение (JPG, PNG и т.д.)');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    handleSubmitOperation({
      e,
      file,
      apiEndpoint: '/api/detect/',
      navigate,
      navigateTo: '/detect/results',
      setLoading,
      setError
    });
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
          disabled={loading || !file}
        >
          {loading ? (
            <>
              <output className="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
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

