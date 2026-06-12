import type { TreeNode, TraversalResult } from "@/types"

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5050/api"

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                => req<T>(path),
  post:   <T>(path: string, body: unknown) => req<T>(path, { method: "POST",  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => req<T>(path, { method: "PUT",   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => req<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string)                => req<T>(path, { method: "DELETE" }),
}

export const treeApi = {
  get:      ()               => api.get<{ tree: TreeNode | null }>("/tree"),
  add:      (val: number)    => api.post<{ tree: TreeNode }>("/tree/add", { val }),
  delete:   (val: number)    => api.post<{ tree: TreeNode | null }>("/tree/delete", { val }),
  reset:    ()               => api.post<{ tree: null }>("/tree/reset", {}),
  example:  ()               => api.post<{ tree: TreeNode }>("/tree/example", {}),
  traversal: (name: string)  => api.get<TraversalResult>(`/traversal/${name}`),
}
