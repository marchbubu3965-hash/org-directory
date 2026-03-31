import { useRef, useState } from 'react'
import { exportExcel, importExcel } from '../api/export_import'

export default function ExportImport({ nickname, onImported }) {
  const fileRef = useRef(null)
  const [importing, setImporting] = useState(false)

  const handleExport = async () => {
    try {
      await exportExcel()
    } catch (err) {
      alert('匯出失敗')
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!nickname) return alert('請先設定暱稱')
    if (!confirm(`確定匯入「${file.name}」？同名單位將會覆蓋更新。`)) return

    setImporting(true)
    try {
      const res = await importExcel(file, nickname)
      alert(`匯入完成！新增：${res.results.created} 筆，更新：${res.results.updated} 筆`)
      onImported()
    } catch (err) {
      alert('匯入失敗，請確認檔案格式是否正確')
    } finally {
      setImporting(false)
      fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
      <button
        onClick={handleExport}
        style={{
          padding: '8px 16px',
          background: '#059669',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        📥 匯出 Excel
      </button>

      <button
        onClick={() => fileRef.current.click()}
        disabled={importing}
        style={{
          padding: '8px 16px',
          background: importing ? '#ccc' : '#d97706',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: importing ? 'not-allowed' : 'pointer',
          fontSize: '14px',
        }}
      >
        {importing ? '匯入中...' : '📤 匯入 Excel'}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
    </div>
  )
}
