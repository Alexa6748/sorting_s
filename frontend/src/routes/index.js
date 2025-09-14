import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClassificationResultPage from '../pages/ClassificationResultPage';
import DetectionResultPage from '../pages/DetectionResultPage';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/classify/result" element={<ClassificationResultPage />} />
      <Route path="/detect/results" element={<DetectionResultPage />} />
    </Routes>
  </Router>
);

export default AppRoutes;
