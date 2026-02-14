const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function getHealth() {
  const res = await fetch(`${API_BASE}/api/v1/health`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getEstablishments() {
  const res = await fetch(`${API_BASE}/api/v1/establishments`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
