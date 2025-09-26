import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, AppContextType } from '@/types';

const initialState: AppState = {
  podcasts: [],
  podcastsDetail: {},
  loading: false,
  error: null,
  filter: '',
};

// Reducer para manejar las acciones del estado
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SET_PODCASTS':
      return {
        ...state,
        podcasts: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_PODCAST_DETAIL':
      return {
        ...state,
        podcastsDetail: {
          ...state.podcastsDetail,
          [action.payload.id]: action.payload.detail,
        },
        loading: false,
        error: null,
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Crear el contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Props del proveedor
interface AppProviderProps {
  children: ReactNode;
}

// Proveedor del contexto
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const contextValue: AppContextType = {
    state,
    dispatch,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider');
  }
  return context;
};

export default AppContext;
