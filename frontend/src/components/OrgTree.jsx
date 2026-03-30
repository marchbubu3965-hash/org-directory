import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrganizations } from '../api/organizations'

export default function OrgTree({ parentId = null }) {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getOrganizations(parentId)
      .then((res) => setOrgs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [parentId])

  if (loading) return <p>載入中...</p>
  if (orgs.length === 0) return <p style={{ color: '#999' }}>此層級無資料</p>

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {orgs.map((org) => (
        <li
          key={org.id}
          onClick={() => navigate(`/org/${org.id}`)}
          style={{
            padding: '14px 16px',
            marginBottom: '8px',
            background: '#f9f9f9',
            borderRadius: '8px',
            cursor: 'pointer',
            borderLeft: '4px solid #4f46e5',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{org.name}</div>
          {org.phone_auto && <div style={{ color: '#555', fontSize: '14px' }}>自動：{org.phone_auto}</div>}
          {org.phone_police && <div style={{ color: '#555', fontSize: '14px' }}>警用：{org.phone_police}</div>}
          {org.phone_railway && <div style={{ color: '#555', fontSize: '14px' }}>鐵路：{org.phone_railway}</div>}
          {org.phone_fax && <div style={{ color: '#555', fontSize: '14px' }}>傳真：{org.phone_fax}</div>}
        </li>
      ))}
    </ul>
  )
}
