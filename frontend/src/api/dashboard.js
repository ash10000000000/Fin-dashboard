import { client } from './client';

export async function fetchSummary() {
  const { data } = await client.get('/api/dashboard/summary');
  return data;
}

export async function fetchCategories() {
  const { data } = await client.get('/api/dashboard/categories');
  return data;
}

export async function fetchTrends(period) {
  const { data } = await client.get('/api/dashboard/trends', { params: { period } });
  return data;
}
