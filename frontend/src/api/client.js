import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
// Uploaded images are served from the backend root (e.g. http://localhost:8000/uploads/x.jpg),
// not under /api, so strip a trailing /api before using it as a static-file base.
export const UPLOADS_URL = API_URL.replace(/\/api\/?$/, '')
export function resolveImage(path) { if (!path) return ''; return /^https?:\/\//.test(path) ? path : `${UPLOADS_URL}${path}` }
export const api = axios.create({ baseURL: API_URL, withCredentials: true, headers: { Accept: 'application/json' } })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('srinidhi_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const fallback = {
  services: [
    { id: 1, title: 'Residential Construction', slug: 'residential-construction', short_description: 'Thoughtful homes shaped around how your family lives.', description: 'From first brick to final handover, we build considered residences with clear communication and durable materials.', icon_or_image: 'home' },
    { id: 2, title: 'Commercial Construction', slug: 'commercial-construction', short_description: 'Workplaces that make a confident first impression.', description: 'Efficient commercial spaces delivered with disciplined planning, safety and finish quality.', icon_or_image: 'building' },
    { id: 3, title: 'Interior Fit-outs', slug: 'interior-fit-outs', short_description: 'Interiors with purpose, polish and a sense of place.', description: 'Complete fit-outs for offices, retail and hospitality with one accountable project team.', icon_or_image: 'sparkles' },
    { id: 4, title: 'Renovation & Restoration', slug: 'renovation-restoration', short_description: 'Give good spaces a better second chapter.', description: 'Sensitive structural upgrades and modern renovations that respect what already works.', icon_or_image: 'refresh-cw' },
    { id: 5, title: 'Project Management', slug: 'project-management', short_description: 'A calm, capable hand from brief to key handover.', description: 'Programme, procurement and site coordination managed with complete visibility.', icon_or_image: 'clipboard-check' }
  ],
  projects: [
    { id: 1, title: 'The Courtyard House', slug: 'the-courtyard-house', category: 'residential', status: 'completed', location: 'Whitefield, Bengaluru', area_sqft: 3250, description: 'A light-filled family home arranged around a planted internal courtyard.', cover_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', is_featured: 1 },
    { id: 2, title: 'Vertex Business Centre', slug: 'vertex-business-centre', category: 'commercial', status: 'completed', location: 'Koramangala, Bengaluru', area_sqft: 28000, description: 'A flexible workplace designed for a growing technology company.', cover_image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85', is_featured: 1 },
    { id: 3, title: 'Indiranagar Residence', slug: 'indiranagar-residence', category: 'residential', status: 'ongoing', location: 'Indiranagar, Bengaluru', area_sqft: 4100, description: 'A warm, modern home with a generous terrace and honest materials.', cover_image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85', is_featured: 1 },
    { id: 4, title: 'Mango Tree Villas', slug: 'mango-tree-villas', category: 'residential', status: 'upcoming', location: 'Devanahalli, Bengaluru', area_sqft: 18600, description: 'Six quiet villas planned around old trees and shared green space.', cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85', is_featured: 0 },
    { id: 5, title: 'Nexus Retail Arcade', slug: 'nexus-retail-arcade', category: 'commercial', status: 'completed', location: 'HSR Layout, Bengaluru', area_sqft: 14500, description: 'A street-facing retail destination with durable, flexible frontage.', cover_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85', is_featured: 0 },
    { id: 6, title: 'Aster Logistics Hub', slug: 'aster-logistics-hub', category: 'industrial', status: 'ongoing', location: 'Hosur Road, Bengaluru', area_sqft: 52000, description: 'A high-performance logistics facility built for daily movement.', cover_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85', is_featured: 0 }
  ]
}
export async function getServices() { try { return (await api.get('/services')).data.data } catch { return fallback.services } }
export async function getProjects(params = {}) { try { return (await api.get('/projects', { params })).data.data } catch { const items = fallback.projects.filter((p) => (!params.category || p.category === params.category) && (!params.status || p.status === params.status)); return { items, pagination: { page: 1, pages: 1, total: items.length } } } }
export async function getProject(slug) { try { return (await api.get(`/projects/${slug}`)).data.data } catch { const project = fallback.projects.find((p) => p.slug === slug); return project ? { ...project, images: [project.cover_image, project.cover_image] } : null } }
export async function submitEnquiry(payload) { return (await api.post('/enquiries', payload)).data }
export async function adminVerify() { return (await api.get('/auth/verify')).data.data }
export async function getDashboard() { return (await api.get('/dashboard/stats')).data.data }
export async function getAdminProjects() { return (await api.get('/projects')).data.data.items }
export async function saveProject(payload, id) { return (await (id ? api.put(`/projects/${id}`, payload) : api.post('/projects', payload))).data.data }
export async function uploadImage(file) { const formData = new FormData(); formData.append('image', file); return (await api.post('/uploads', formData)).data.data.path }
export async function deleteProject(id) { return (await api.delete(`/projects/${id}`)).data }
export async function getAdminServices() { return (await api.get('/services')).data.data }
export async function saveService(payload, id) { return (await (id ? api.put(`/services/${id}`, payload) : api.post('/services', payload))).data.data }
export async function deleteService(id) { return (await api.delete(`/services/${id}`)).data }
export async function getEnquiries() { return (await api.get('/enquiries')).data.data }
export async function updateEnquiry(id, status) { return (await api.patch(`/enquiries/${id}`, { status })).data.data }
export async function deleteEnquiry(id) { return (await api.delete(`/enquiries/${id}`)).data }
export async function logoutAdmin() { return (await api.post('/auth/logout')).data }
export { fallback }