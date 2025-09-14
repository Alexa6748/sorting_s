import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the RouterProvider since it requires a router object
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  RouterProvider: ({ router }) => <div data-testid="router-provider">App Router</div>,
  createBrowserRouter: jest.fn()
}));

// Mock axios and related modules to avoid import issues
jest.mock('axios', () => ({
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  },
  post: jest.fn()
}));

// Mock the metrics modules to avoid axios import issues
jest.mock('../utils/metrics', () => ({
  getMetrics: jest.fn(() => ({})),
  resetMetrics: jest.fn(),
  recordHttpRequestDuration: jest.fn(),
  incrementHttpRequestTotal: jest.fn(),
  incrementFrontendErrorsTotal: jest.fn(),
  incrementUserInteractionsTotal: jest.fn(),
  incrementImageUploadsTotal: jest.fn(),
  incrementModelRequestsTotal: jest.fn()
}));

// Mock the metricsSender to avoid axios import issues
jest.mock('../utils/metricsSender', () => ({
  startSending: jest.fn(),
  stopSending: jest.fn()
}));

// Mock the apiInterceptor
jest.mock('../utils/apiInterceptor', () => {});

test('renders app with router provider', () => {
  render(<App />);
  const routerElement = screen.getByTestId('router-provider');
  expect(routerElement).toBeInTheDocument();
});
