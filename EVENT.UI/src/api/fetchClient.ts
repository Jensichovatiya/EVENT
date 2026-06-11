const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5209/api';

export const fetchClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }

  return result;
};
