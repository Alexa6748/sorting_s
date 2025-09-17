// frontend/src/App.js
import React from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ClassificationUploadPage from './pages/ClassificationUploadPage';
import ClassificationResultPage from './pages/ClassificationResultPage';
import DetectionUploadPage from './pages/DetectionUploadPage';
import DetectionResultPage from './pages/DetectionResultPage';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
  return <RouterProvider router={router} />;
}

export default App;
