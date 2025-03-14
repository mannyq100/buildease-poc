import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logEnvironmentInfo } from './lib/env-config'

// Log environment information on app startup
logEnvironmentInfo()

// Set document title based on environment
document.title = import.meta.env.VITE_APP_TITLE || 'BuildEase'

createRoot(document.getElementById("root")!).render(<App />)
