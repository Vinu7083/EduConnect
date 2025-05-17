import { createContext, useReducer, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthState, User, LoginCredentials, RegisterData, ApiResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

interface JWTPayload {
  userId: string;
  exp: number;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  checkAuth: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = useCallback(() => {
    dispatch({ type: 'AUTH_START' });
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return;
    }
    
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }
      
      // Set token on the API client
      api.setToken(token);
      
      // Get user data
      api.get<ApiResponse<User>>('/users/me')
        .then(response => {
          if (response.data?.data) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data.data, token }
            });
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_LOGOUT' });
        });
      
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
      
      if (response.data?.success && response.data.data) {
        const { user, token } = response.data.data;
        
        localStorage.setItem('token', token);
        api.setToken(token);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
      
      if (response.data?.success && response.data.data) {
        const { user, token } = response.data.data;
        
        localStorage.setItem('token', token);
        api.setToken(token);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.removeToken();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};