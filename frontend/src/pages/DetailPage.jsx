import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrganization, createOrganization } from '../api/organizations'
import { useNickname } from '../hooks/useNickname'
import OrgDetail from '../components/OrgDetail'
import OrgTree from '../components/OrgTree'
import LogList from '../components/LogList'
import SearchBar from '../components/SearchBar'

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { nickname } = useNickname()
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '', phone_auto: '', phone_police: '',
    phone_railway: '', phone_fax: '', address: '', note: ''
  })
  const [refresh, setRefresh] = useState(0)
  const [showLogs, setShowLogs] = useState(false)

  const fetchOrg = () => {
    setLoading(true)
    getOrganization(Number(id))
      .then((res) => setOrg(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrg() }, [id])

  const handleAdd = async () => {
    if (!nickname) return alert('請先設定暱稱')
    if (!form.name.trim()) return alert('請輸入單位名稱')
    try {
      await createOrganization({ ...form, parent_id: Number(id), changed_by: nickname })
      setShowAdd(false)
      setForm({ name: '', phone_auto: '', phone_police: '', phone_railway: '', phone_fax: '', address: '', note: '' })
      setRefresh(r => r + 1)
    } catch (err) {
      alert('新增失敗')
    }
  }

  const fieldStyle = {
    width: '100%', padding: '8px 12px', fontSize: '15px',
    borderRadius: '6px', border: '1px solid #ccc',
    boxSizing: 'border-box', marginBottom: '8px',
  }

  if (loading) return <div style={{ padding: '16px' }}>載入中...</div>
  if (!org) return null

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '12px', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '15px' }}>← 返回</button>

      <SearchBar />

      <h1 style={{ fontSize: '22px', margin: '16px 0 8px' }}>{org.name}</h1>

      <OrgDetail org={org} nickname={nickname} onUpdated={fetchOrg} />

      <div style={{ margin: '24px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', margin: 0 }}>子單位</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ 新增</button>
      </div>

      {showAdd && (
        <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '16px' }}>
          {[
            { label: '單位名稱 *', name: 'name' },
            { label: '自動電話', name: 'phone_auto' },
            { label: '警用電話', name: 'phone_police' },
            { label: '鐵路電話', name: 'phone_railway' },
            { label: '傳真電話', name: 'phone_fax' },
            { label: '地址', name: 'address' },
            { label: '備註', name: 'note' },
          ].map(({ label, name }) => (
            <div key={name}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '2px' }}>{label}</label>
              <input name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} style={fieldStyle} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleAdd} style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>新增</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>取消</button>
          </div>
        </div>
      )}

      <OrgTree key={refresh} parentId={Number(id)} />

      <div style={{ marginTop: '24px' }}>
        <button onClick={() => setShowLogs(!showLogs)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '15px', padding: 0 }}>
          {showLogs ? '▲ 隱藏修改紀錄' : '▼ 顯示修改紀錄'}
        </button>
        {showLogs && (
          <div style={{ marginTop: '12px' }}>
            <LogList orgId={Number(id)} />
          </div>
        )}
      </div>
    </div>
  )
}
