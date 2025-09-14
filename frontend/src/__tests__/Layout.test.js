import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

// Mock the Bootstrap CDN links since they're in the component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>
}));

describe('Layout', () => {
  test('renders navbar with brand name', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );
    
    const brandElement = screen.getByText(/WasteSorter/i);
    expect(brandElement).toBeInTheDocument();
    expect(brandElement.tagName).toBe('A');
    expect(brandElement).toHaveAttribute('href', '/');
  });

  test('renders outlet for page content', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );
    
    const outletElement = screen.getByTestId('outlet');
    expect(outletElement).toBeInTheDocument();
  });

  test('renders footer with copyright', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );
    
    const footerElement = screen.getByText(/Система автоматической сортировки мусора/i);
    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass('text-center');
  });
});