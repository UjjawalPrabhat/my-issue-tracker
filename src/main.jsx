import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// We're keeping the import but not calling it at startup
// import { initializeAppData } from './utils/createInitialData'

// Error handling for the entire application
const renderApp = () => {
  try {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    console.error("Failed to render app:", error);
    // Create a fallback UI if the app fails to render
    const rootElement = document.getElementById('root');
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h1>Something went wrong</h1>
        <p>The application failed to initialize. Please try refreshing the page.</p>
        <p style="color: gray; font-size: 14px;">Error: ${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Refresh
        </button>
      </div>
    `;
  }
}

renderApp();
