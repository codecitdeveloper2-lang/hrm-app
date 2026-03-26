// Simple store placeholder
// Replace with Redux, Zustand, or Context API as needed

import React, {createContext, useContext, useReducer} from 'react';
import {User} from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
}

type Action =
  | {type: 'SET_USER'; payload: User}
  | {type: 'LOGOUT'};

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {...state, user: action.payload, isAuthenticated: true};
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export function AppProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{state, dispatch}}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  return useContext(AppContext);
}
