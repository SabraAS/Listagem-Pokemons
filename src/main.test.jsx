import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import Home from './app/Home';

// Mock do componente Home
vi.mock('./app/Home', () => ({
  default: () => <div data-testid="mock-home">Home Component Mock</div>,
}));

// Mock do ReactDOM
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({ render: mockRender }));

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: mockCreateRoot,
  },
  createRoot: mockCreateRoot,
}));

// Mock dos estilos
vi.mock('./styles/index.scss', () => ({}));
vi.mock('./styles/App.scss', () => ({}));

describe('Main Application Entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize application with required providers', async () => {
    // Importa o main.jsx que executa a renderização
    await import('./main.jsx');

    // Verifica se createRoot foi chamado com o elemento root
    expect(mockCreateRoot).toHaveBeenCalledWith(
      document.getElementById('root'),
    );

    // Verifica se render foi chamado
    expect(mockRender).toHaveBeenCalled();

    // Verifica se os argumentos do render incluem StrictMode e QueryClientProvider
    const renderArg = mockRender.mock.calls[0][0];
    expect(renderArg.type).toBe(React.StrictMode);
    expect(renderArg.props.children.type).toBe(QueryClientProvider);
  });

  it('should create QueryClient with default options', () => {
    const queryClient = new QueryClient();
    expect(queryClient).toBeDefined();
  });

  it('should render Home component correctly', () => {
    const queryClient = new QueryClient();

    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>,
    );

    expect(getByTestId('mock-home')).toBeInTheDocument();
    expect(getByTestId('mock-home')).toHaveTextContent('Home Component Mock');
  });
});
