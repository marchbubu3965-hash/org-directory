import { useEffect, useState } from 'react'
import { getLogs } from '../api/organizations'

export default function LogList({ orgId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLogs(orgId)
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [orgId])

  if (loading) return <p>載入中...</p>
  if (logs.length === 0) return <p style={{ color: '#999' }}>尚無修改紀錄</p>

  const actionLabel = { create: '新增', update: '修改', delete: '刪除' }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {logs.map((log) => (
        <li key={log.id} style={{
          padding: '10px 14px',
          marginBottom: '8px',
          background: '#f5f5f5',
          borderRadius: '6px',
          fontSize: '14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>{actionLabel[log.action] || log.action}</span>
            <span style={{ color: '#999' }}>{new Date(log.changed_at).toLocaleString('zh-TW')}</span>
          </div>
          <div style={{ color: '#555' }}>修改人：{log.changed_by}</div>
          {log.field_changed && (
            <div style={{ color: '#555' }}>
              欄位：{log.field_changed}　
              {log.old_value && <span>舊值：{log.old_value}　</span>}
              {log.new_value && <span>新值：{log.new_value}</span>}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
