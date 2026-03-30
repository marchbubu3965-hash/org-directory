import client from './client'

export const getOrganizations = (parent_id = null) => {
  const params = parent_id !== null ? { parent_id } : {}
  return client.get('/organizations/', { params })
}

export const getOrganization = (id) => {
  return client.get(`/organizations/${id}`)
}

export const createOrganization = (data) => {
  return client.post('/organizations/', data)
}

export const updateOrganization = (id, data) => {
  return client.put(`/organizations/${id}`, data)
}

export const deleteOrganization = (id, changed_by) => {
  return client.delete(`/organizations/${id}`, { data: { changed_by } })
}

export const getLogs = (id) => {
  return client.get(`/organizations/${id}/logs`)
}
