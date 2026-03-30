import client from './client'

export const searchOrganizations = (q, limit = 20, offset = 0) => {
  return client.get('/search/', { params: { q, limit, offset } })
}
