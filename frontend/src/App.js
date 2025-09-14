// frontend/src/App.js
import React, { useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ClassificationUploadPage from './pages/ClassificationUploadPage';
import ClassificationResultPage from './pages/ClassificationResultPage';
import DetectionUploadPage from './pages/DetectionUploadPage';
import DetectionResultPage from './pages/DetectionResultPage';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import metricsSender from './utils/metricsSender';
import './utils/apiInterceptor'; // Import the API interceptor

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "classify", element: <ClassificationUploadPage /> },
      { path: "classify/result", element: <ClassificationResultPage /> },
      { path: "detect", element: <DetectionUploadPage />},
      { path: "detect/results", element: <DetectionResultPage />}
    ]
  }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }
});

function App() {
  useEffect(() => {
    // Start sending metrics periodically
    metricsSender.startSending();
    
    // Cleanup function to stop sending when component unmounts
    return () => {
      metricsSender.stopSending();
    };
  }, []);
  
  return <RouterProvider router={router} />;
}

export default App;
