import { client } from './client';

export async function listUsers(params) {
  const { data } = await client.get('/api/users', { params });
  return data;
}

export async function getUser(id) {
  const { data } = await client.get(`/api/users/${id}`);
  return data;
}

export async function createUser(body) {
  const { data } = await client.post('/api/users', body);
  return data;
}

export async function updateUser(id, body) {
  const { data } = await client.patch(`/api/users/${id}`, body);
  return data;
}

export async function deactivateUser(id) {
  const { data } = await client.delete(`/api/users/${id}`);
  return data;
}
