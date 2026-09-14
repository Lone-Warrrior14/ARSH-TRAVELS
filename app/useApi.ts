"use client";
import { useState, useEffect } from "react";
import { fetchFromApi } from "@/lib/api";

export function useApi<T>(endpoint: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFromApi(endpoint).then(res => {
      setData(res || defaultValue);
      setLoading(false);
    });
  }, [endpoint]);

  return { data, loading, mutate: setData };
}
