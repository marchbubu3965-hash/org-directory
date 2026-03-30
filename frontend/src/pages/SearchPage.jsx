import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { searchOrganizations } from '../api/search'
import SearchBar from '../components/SearchBar'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    if (!q.trim()) return
    setLoading(true)
    searchOrganizations(q)
      .then((res) => setResults(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '12px', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '15px' }}>← 返回</button>
      <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>搜尋結果</h1>
      <SearchBar />
      {loading && <p>搜尋中...</p>}
      {!loading && results.length === 0 && q && <p style={{ color: '#999' }}>找不到「{q}」相關結果</p>}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
        {results.map((org) => (
          <li
            key={org.id}
            onClick={() => navigate(`/org/${org.id}`)}
            style={{
              padding: '14px 16px', marginBottom: '8px',
              background: '#f9f9f9', borderRadius: '8px',
              cursor: 'pointer', borderLeft: '4px solid #4f46e5',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{org.name}</div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>{org.path}</div>
            {org.phone_auto && <div style={{ fontSize: '14px', color: '#555' }}>自動：{org.phone_auto}</div>}
            {org.phone_police && <div style={{ fontSize: '14px', color: '#555' }}>警用：{org.phone_police}</div>}
            {org.phone_railway && <div style={{ fontSize: '14px', color: '#555' }}>鐵路：{org.phone_railway}</div>}
            {org.phone_fax && <div style={{ fontSize: '14px', color: '#555' }}>傳真：{org.phone_fax}</div>}
          </li>
        ))}
      </ul>
    </div>
  )
}
