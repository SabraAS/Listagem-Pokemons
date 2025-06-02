import { QueryClient } from '@tanstack/react-query';
import { vi } from 'vitest';

import { usePokemons } from '@/queries/pokemon';
import { usePokemonStore } from '@/store/pokemon';

// Mock dos módulos
vi.mock('@/queries/pokemon', () => ({
  usePokemons: vi.fn(),
}));

vi.mock('@/store/pokemon', () => ({
  usePokemonStore: vi.fn(),
}));

/**
 * Cria um QueryClient configurado para testes de usabilidade
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
    },
  });
};

/**
 * Configuração padrão para mocks dos testes de usabilidade
 */
export const createUsabilityTestSetup = () => {
  const mockAddPokemon = vi.fn();
  const mockRemovePokemon = vi.fn();
  const mockClearTeam = vi.fn();

  const currentMockState = {
    pokemons: [],
    addPokemon: mockAddPokemon,
    removePokemon: mockRemovePokemon,
    clearTeam: mockClearTeam,
  };

  const resetMocks = () => {
    vi.clearAllMocks();

    // Reset mock functions
    mockAddPokemon.mockClear();
    mockRemovePokemon.mockClear();
    mockClearTeam.mockClear();

    // Reset current mock state
    currentMockState.pokemons = [];
    currentMockState.addPokemon = mockAddPokemon;
    currentMockState.removePokemon = mockRemovePokemon;
    currentMockState.clearTeam = mockClearTeam;

    usePokemons.mockReturnValue({
      data: [],
      isLoading: false,
    });

    // Mock Zustand store to handle both patterns:
    // 1. usePokemonStore() - returns full store object (used in Home)
    // 2. usePokemonStore(selector) - calls selector with store (used in CartSidebar)
    usePokemonStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(currentMockState);
      }
      // If no selector, return the full store object
      return currentMockState;
    });
  };

  return {
    mockAddPokemon,
    mockRemovePokemon,
    mockClearTeam,
    currentMockState,
    resetMocks,
  };
};
