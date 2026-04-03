import { client } from './client';

export async function loginRequest(payload) {
  const { data } = await client.post('/api/auth/login', payload);
  return data;
}

export async function logoutRequest() {
  const { data } = await client.post('/api/auth/logout');
  return data;
}

export async function meRequest() {
  const { data } = await client.get('/api/auth/me');
  return data;
}
