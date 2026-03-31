import client from './client'

export const exportExcel = async () => {
  const response = await client.get('/export', { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'org_directory.xlsx')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const importExcel = async (file, changed_by) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('changed_by', changed_by)
  const response = await client.post('/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}
