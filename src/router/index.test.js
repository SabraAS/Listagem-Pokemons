import { render, screen } from '@testing-library/react';
import PropTypes from 'prop-types';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import AppRoutes, { routeConfig } from './index';

// Mock dos componentes
vi.mock('@/app/Home', () => ({
  default: () =>
    React.createElement(
      'div',
      { 'data-testid': 'mock-home' },
      'Home Component',
    ),
}));

// Mock do react-query
vi.mock('@tanstack/react-query', () => {
  const MockProvider = ({ children }) =>
    React.createElement('div', null, children);
  MockProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  return {
    QueryClient: vi.fn(),
    QueryClientProvider: MockProvider,
  };
});

describe('AppRoutes', () => {
  it('should render Home component at root path', () => {
    render(React.createElement(AppRoutes));
    expect(screen.getByTestId('mock-home')).toBeInTheDocument();
  });

  it('should render Home component with correct content', () => {
    render(React.createElement(AppRoutes));
    expect(screen.getByText('Home Component')).toBeInTheDocument();
  });

  it('should have correct route configuration', () => {
    expect(routeConfig).toEqual([
      {
        path: '/',
        element: expect.any(Object),
        exact: true,
      },
    ]);
  });

  it('should render Routes with correct configuration', () => {
    const { container } = render(React.createElement(AppRoutes));

    // Verifica se o BrowserRouter está presente
    expect(container.firstChild).toBeTruthy();

    // Verifica se o componente Home está sendo renderizado
    expect(screen.getByTestId('mock-home')).toBeInTheDocument();
  });
});
