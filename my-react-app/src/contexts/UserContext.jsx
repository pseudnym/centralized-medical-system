import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCurrentPatientName } from '../api/auth'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [patientName, setPatientName] = useState('')

  const refreshPatientName = useCallback(() => {
    getCurrentPatientName().then((name) => setPatientName(name ?? ''))
  }, [])

  useEffect(() => {
    refreshPatientName()
  }, [refreshPatientName])

  const value = {
    patientName: patientName || 'Profile',
    refreshPatientName,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}
