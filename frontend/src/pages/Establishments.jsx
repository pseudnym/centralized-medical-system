import { useEffect, useState } from 'react'
import { getEstablishments } from '../api'

export default function Establishments() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getEstablishments()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-600">Loading…</p>
  if (error) return <p className="text-red-600">Error: {error}</p>
  if (list.length === 0) return <p className="text-gray-600">No establishments.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Establishments</h1>
      <ul className="mt-4 space-y-2">
        {list.map((e) => (
          <li key={e.id} className="rounded border bg-white p-3 shadow-sm">
            <span className="font-medium">{e.name}</span>
            {e.address && <span className="ml-2 text-gray-600">— {e.address}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
