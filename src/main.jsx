import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import router from './router/Router'
import { RouterProvider } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
    <StrictMode>
    <RouterProvider router={router} />
    </StrictMode>
)
