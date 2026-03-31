import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import OrgTree from '../components/OrgTree'
import ExportImport from '../components/ExportImport'
import { useNickname } from '../hooks/useNickname'
import { createOrganization } from '../api/organizations'

export default function HomePage() {
  const { nickname, setNickname } = useNickname()
  const [nicknameInput, setNicknameInput] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '', phone_auto: '', phone_police: '',
    phone_railway: '', phone_fax: '', address: '', note: ''
  })
  const [refresh, setRefresh] = useState(0)
  const navigate = useNavigate()

  const handleSetNickname = () => {
    if (!nicknameInput.trim()) return
    setNickname(nicknameInput.trim())
  }

  const handleAdd = async () => {
    if (!nickname) return alert('請先設定暱稱')
    if (!form.name.trim()) return alert('請輸入單位名稱')
    try {
      await createOrganization({ ...form, changed_by: nickname })
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>📞 組織電話簿</h1>

      {!nickname ? (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '14px' }}>請先輸入您的暱稱：</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="暱稱"
              style={{ ...fieldStyle, marginBottom: 0 }}
            />
            <button onClick={handleSetNickname} style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>確認</button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>目前暱稱：{nickname}　<span onClick={() => setNickname('')} style={{ color: '#4f46e5', cursor: 'pointer' }}>更換</span></p>
      )}

      <SearchBar />

      <ExportImport nickname={nickname} onImported={() => setRefresh(r => r + 1)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
        <h2 style={{ fontSize: '16px', margin: 0 }}>根層級單位</h2>
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

      <OrgTree key={refresh} parentId={null} />
    </div>
  )
}
