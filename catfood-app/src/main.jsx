import ReactDOM from 'react-dom/client'
import CatFoodAnalysis from './App.jsx'

// localStorage polyfill for window.storage API
window.storage = {
  get: async (key) => {
    const value = localStorage.getItem(key)
    if (value === null) throw new Error('not found')
    return { key, value }
  },
  set: async (key, value) => {
    localStorage.setItem(key, value)
    return { key, value }
  },
  delete: async (key) => {
    localStorage.removeItem(key)
    return { key, deleted: true }
  },
  list: async (prefix = '') => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
    return { keys }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<CatFoodAnalysis />)
