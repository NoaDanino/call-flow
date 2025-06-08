import axios from 'axios';

const AUTH_URL = 'http://localhost:3001';

export async function handlePhishingAttempt(email: string) {
  const token = localStorage.getItem('authToken');

  console.log('Attempting phishing email:', email);
  try {
    const response = await axios.post(
      `${AUTH_URL}/phishing-manager/send`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response);
    console.log('Phishing attempt done successfully:', response.data);
    return { status: response.status, data: response.data };
  } catch (error: any) {
    checkIfUserAuthorized(error);
    console.error('Phishing attempt error:', error.response?.data || error.message);
    return { status: error.status || 500, error: error.response?.data?.message || 'Login failed' };
  }
}

export async function getAllAttempts() {
  const token = localStorage.getItem('authToken');
  console.log('token:', token);

  try {
    const response = await axios.get(`${AUTH_URL}/phishing-manager/all-attempts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    checkIfUserAuthorized(error);
    console.error('Error fetching phishing attempts:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch phishing attempts');
  }
}

// export async function getAttemptById() {

// }

async function checkIfUserAuthorized(error: any) {
  console.log('Checking user authorization:', error);
  if (error.response?.status === 401) {
    // Token expired or unauthorized
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
}
