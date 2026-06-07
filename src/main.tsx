import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { AddictionProvider } from './context/AddictionContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AddictionProvider>
          <App />
      </AddictionProvider>
  </StrictMode>
)
