import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getEstablishment,
  getRecords,
  getPatients,
  createPatient,
  uploadRecord,
  getRecordFileUrl,
} from '../api'

export default function EstablishmentDetail() {
  const { id } = useParams()
  const [establishment, setEstablishment] = useState(null)
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [newPatientName, setNewPatientName] = useState('')
  const [creatingPatient, setCreatingPatient] = useState(false)
  const [createPatientError, setCreatePatientError] = useState(null)

  const loadEstablishment = () => {
    if (!id) return
    getEstablishment(id)
      .then(setEstablishment)
      .catch((e) => setError(e.message))
  }

  const loadRecords = () => {
    if (!id) return
    getRecords(id)
      .then(setRecords)
      .catch((e) => setError(e.message))
  }

  const loadPatients = () => {
    getPatients()
      .then(setPatients)
      .catch(() => setPatients([]))
  }

  const handleCreatePatient = (e) => {
    e.preventDefault()
    const name = newPatientName.trim()
    if (!name) return
    setCreatePatientError(null)
    setCreatingPatient(true)
    createPatient({ name })
      .then((p) => {
        setPatients((prev) => [...prev, p])
        setSelectedPatientId(String(p.id))
        setNewPatientName('')
      })
      .catch((e) => setCreatePatientError(e.message))
      .finally(() => setCreatingPatient(false))
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([
      getEstablishment(id),
      getRecords(id),
      getPatients(),
    ])
      .then(([est, recs, pats]) => {
        setEstablishment(est)
        setRecords(recs)
        setPatients(Array.isArray(pats) ? pats : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpload = (e) => {
    e.preventDefault()
    const patientId = selectedPatientId ? Number(selectedPatientId) : null
    if (!patientId || !selectedFile) {
      setUploadError('Please select a patient and a PDF file.')
      return
    }
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are allowed.')
      return
    }
    setUploadError(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('patient_id', patientId)
    formData.append('file', selectedFile)
    uploadRecord(Number(id), formData)
      .then(() => {
        loadRecords()
        setSelectedFile(null)
        setUploadError(null)
      })
      .catch((e) => setUploadError(e.message))
      .finally(() => setUploading(false))
  }

  if (loading) return <p className="text-gray-600">Loading…</p>
  if (error) return <p className="text-red-600">Error: {error}</p>
  if (!establishment) return <p className="text-gray-600">Establishment not found.</p>

  return (
    <div>
      <nav className="mb-4 text-sm text-gray-600">
        <Link to="/establishments" className="text-blue-600 hover:underline">← Establishments</Link>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900">{establishment.name}</h1>
      {establishment.address && (
        <p className="mt-1 text-gray-600">{establishment.address}</p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Records</h2>

        <form onSubmit={handleUpload} className="mt-3 rounded border bg-white p-4 shadow-sm">
          <h3 className="font-medium text-gray-700">Upload PDF</h3>
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm text-gray-600">Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="mt-1 rounded border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select patient…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {patients.length === 0 && (
                <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2">
                  <p className="text-sm text-amber-800">No patients yet. Create one below.</p>
                  <form onSubmit={handleCreatePatient} className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="Patient name"
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={creatingPatient || !newPatientName.trim()}
                      className="rounded bg-amber-600 px-3 py-1 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      {creatingPatient ? 'Adding…' : 'Add patient'}
                    </button>
                  </form>
                  {createPatientError && <p className="mt-1 text-xs text-red-600">{createPatientError}</p>}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600">PDF file</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-1 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !selectedPatientId || !selectedFile}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
        </form>

        <ul className="mt-4 space-y-2">
          {records.length === 0 && <li className="text-gray-500">No records yet.</li>}
          {records.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded border bg-white p-3 shadow-sm">
              <span className="font-medium text-gray-900">{r.file_name}</span>
              <a
                href={getRecordFileUrl(r.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View / Download
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
