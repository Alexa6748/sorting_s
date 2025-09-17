import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the RouterProvider since it requires a router object
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  RouterProvider: ({ router }) => <div data-testid="router-provider">App Router</div>
}));

test('renders app with router provider', () => {
  render(<App />);
  const routerElement = screen.getByTestId('router-provider');
  expect(routerElement).toBeInTheDocument();
});
