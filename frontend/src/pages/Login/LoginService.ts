import axios from 'axios';

const AUTH_URL = 'http://localhost:3008';

export async function handleLogin(data: { email: string; password: string }) {
  console.log('Attempting to login with data:', data);
  try {
    const response = await axios.post(`${AUTH_URL}/auth/login`, {
      email: data.email,
      password: data.password,
    });

    console.log(response);
    console.log('Login success:', response.data);
    localStorage.setItem('authToken', response.data.token);
    return { status: response.status, data: response.data };
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    return { status: error.status || 500, error: error.response?.data?.message || 'Login failed' };
  }
}
