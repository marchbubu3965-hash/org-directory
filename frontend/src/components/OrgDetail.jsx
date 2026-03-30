import { useState } from 'react'
import { updateOrganization, deleteOrganization } from '../api/organizations'
import { useNavigate } from 'react-router-dom'

export default function OrgDetail({ org, nickname, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...org })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!nickname) return alert('請先設定暱稱')
    try {
      await updateOrganization(org.id, { ...form, changed_by: nickname })
      setEditing(false)
      onUpdated()
    } catch (err) {
      alert('更新失敗')
    }
  }

  const handleDelete = async () => {
    if (!nickname) return alert('請先設定暱稱')
    if (!confirm(`確定刪除「${org.name}」？`)) return
    try {
      await deleteOrganization(org.id, nickname)
      navigate('/')
    } catch (err) {
      alert('刪除失敗')
    }
  }

  const fieldStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    marginBottom: '8px',
  }

  const labelStyle = {
    fontSize: '13px',
    color: '#666',
    marginBottom: '2px',
    display: 'block',
  }

  return (
    <div>
      {editing ? (
        <div>
          {[
            { label: '單位名稱', name: 'name' },
            { label: '自動電話', name: 'phone_auto' },
            { label: '警用電話', name: 'phone_police' },
            { label: '鐵路電話', name: 'phone_railway' },
            { label: '傳真電話', name: 'phone_fax' },
            { label: '地址', name: 'address' },
            { label: '備註', name: 'note' },
          ].map(({ label, name }) => (
            <div key={name}>
              <label style={labelStyle}>{label}</label>
              <input
                name={name}
                value={form[name] || ''}
                onChange={handleChange}
                style={fieldStyle}
              />
            </div>
          ))}
          <button onClick={handleSave} style={{ marginRight: '8px', padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>儲存</button>
          <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>取消</button>
        </div>
      ) : (
        <div>
          {[
            { label: '自動電話', value: org.phone_auto, tel: true },
            { label: '警用電話', value: org.phone_police, tel: true },
            { label: '鐵路電話', value: org.phone_railway, tel: true },
            { label: '傳真電話', value: org.phone_fax, tel: false },
            { label: '地址', value: org.address, tel: false },
            { label: '備註', value: org.note, tel: false },
          ].map(({ label, value, tel }) =>
            value ? (
              <div key={label} style={{ marginBottom: '10px' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>{label}：</span>
                {tel ? (
                  <a href={`tel:${value}`} style={{ fontSize: '16px', color: '#4f46e5' }}>{value}</a>
                ) : (
                  <span style={{ fontSize: '15px' }}>{value}</span>
                )}
              </div>
            ) : null
          )}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditing(true)} style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>編輯</button>
            <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>刪除</button>
          </div>
        </div>
      )}
    </div>
  )
}
