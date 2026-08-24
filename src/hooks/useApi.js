import { useCallback, useEffect, useState } from "react";
import api, { connectionState } from "../services/api";

// Hook CRUD dùng chung cho mọi resource: providers, vehicles, orders, ...
export function useApi(resource) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(connectionState.mode);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list(resource);
      setItems(data);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setMode(connectionState.mode);
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const create = useCallback(
    async (payload) => {
      const created = await api.create(resource, payload);
      setMode(connectionState.mode);
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [resource]
  );

  const update = useCallback(
    async (id, payload) => {
      const updated = await api.update(resource, id, payload);
      setMode(connectionState.mode);
      setItems((prev) => prev.map((i) => (String(i.id) === String(id) ? { ...i, ...updated } : i)));
      return updated;
    },
    [resource]
  );

  const remove = useCallback(
    async (id) => {
      await api.remove(resource, id);
      setMode(connectionState.mode);
      setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
    },
    [resource]
  );

  return { items, loading, error, mode, refetch, create, update, remove, setItems };
}
