import { useCallback, useState } from 'react';
import { listUsers } from '../api/users';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_DEFAULT_PAGE } from '../constants';

export function useUsers() {
  const [page, setPage] = useState(PAGINATION_DEFAULT_PAGE);
  const [limit] = useState(PAGINATION_DEFAULT_LIMIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const load = useCallback(
    async (nextPage) => {
      setLoading(true);
      setError(null);
      try {
        const res = await listUsers({ page: nextPage, limit });
        setResult(res.data);
        setPage(nextPage);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  return {
    page,
    limit,
    loading,
    error,
    result,
    load,
  };
}
