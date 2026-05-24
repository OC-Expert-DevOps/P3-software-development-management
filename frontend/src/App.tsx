import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/health`)
        setHealthStatus(`Backend Status: ${response.data.status} (Pinged at ${new Date(response.data.timestamp).toLocaleTimeString()})`)
      } catch (error) {
        setHealthStatus('Backend Status: OFFLINE')
      }
    }

    checkHealth()
  }, [])

  return (
    <>
      <h1>DataShare MVP</h1>
      <div className="card">
        <p>Frontend is running!</p>
        <p><strong>{healthStatus}</strong></p>
      </div>
    </>
  )
}

export default App