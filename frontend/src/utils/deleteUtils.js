// Utility function for handling delete operations
export const handleDeleteOperation = async ({
  imageId,
  apiEndpoint,
  successMessage,
  errorMessage,
  navigate,
  navigateTo,
  setIsDeleting,
  setError
}) => {
  try {
    setIsDeleting(true);
    
    if (!imageId) {
      throw new Error('ID изображения не найден в ответе API');
    }

    const response = await fetch(apiEndpoint, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`);
    }

    alert(successMessage);
    navigate(navigateTo);
  } catch (error) {
    console.error('Ошибка при удалении:', error);
    alert(`${errorMessage} ${error.message}`);
  } finally {
    setIsDeleting(false);
  }
};

// Utility function for handling form submission operations
export const handleSubmitOperation = async ({
  e,
  file,
  apiEndpoint,
  navigate,
  navigateTo,
  setLoading,
  setError
}) => {
  e.preventDefault();
  
  setLoading(true);
  setError('');
  
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorData}`);
    }
    
    const data = await response.json();
    
    navigate(navigateTo, { 
      state: { 
        result: data,
        image: URL.createObjectURL(file)
      } 
    });
  } catch (err) {
    let errorMessage = `Ошибка: ${err.message}`;
    
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