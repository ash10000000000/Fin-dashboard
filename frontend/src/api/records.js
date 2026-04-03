import { client } from './client';

export async function listRecords(params) {
  const { data } = await client.get('/api/records', { params });
  return data;
}

export async function getRecord(id) {
  const { data } = await client.get(`/api/records/${id}`);
  return data;
}

export async function createRecord(body) {
  const { data } = await client.post('/api/records', body);
  return data;
}

export async function updateRecord(id, body) {
  const { data } = await client.patch(`/api/records/${id}`, body);
  return data;
}

export async function deleteRecord(id) {
  const { data } = await client.delete(`/api/records/${id}`);
  return data;
}
