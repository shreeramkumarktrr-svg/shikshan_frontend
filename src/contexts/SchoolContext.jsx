import { createContext, useContext, useState } from 'react'

const SchoolContext = createContext()

export function SchoolProvider({ children }) {
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [schools, setSchools] = useState([])

  const value = {
    selectedSchool,
    setSelectedSchool,
    schools,
    setSchools
  }

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  )
}

export function useSchool() {
  const context = useContext(SchoolContext)
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider')
  }
  return context
}