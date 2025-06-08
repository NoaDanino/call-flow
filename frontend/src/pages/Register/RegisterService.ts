import axios from 'axios';

const AUTH_URL = 'http://localhost:3008';

export async function handleRegister(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  try {
    const response = await axios.post(`${AUTH_URL}/auth/register`, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });

    console.log('Registration success:', response.data);
    return { status: response.status, data: response.data };
  } catch (error: any) {
    console.error('Register error:', error.response?.data || error.message);
    return {
      status: error.status || 500,
      error: error.response?.data?.message || 'Registration failed',
    };
  }
}
