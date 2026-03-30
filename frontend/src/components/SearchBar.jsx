import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const timer = useRef(null)

  useEffect(() => {
    if (!query.trim()) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }, 300)
    return () => clearTimeout(timer.current)
  }, [query])

  return (
    <div style={{ padding: '8px 0' }}>
      <input
        type="text"
        placeholder="搜尋單位名稱、電話、備註..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
