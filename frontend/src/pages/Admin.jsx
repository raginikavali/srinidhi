import { Component, useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, BriefcaseBusiness, ClipboardList, Inbox, Loader2, LogOut, Pencil, Plus, Settings2, Trash2, Upload, X } from 'lucide-react'
import { api, adminVerify, deleteEnquiry, deleteProject, deleteService, getAdminProjects, getAdminServices, getDashboard, getEnquiries, logoutAdmin, resolveImage, saveProject, saveService, updateEnquiry, uploadImage } from '../api/client'

const emptyProject = { title: '', category: 'residential', status: 'ongoing', location: '', area_sqft: '', description: '', cover_image: '', is_featured: 0 }
const emptyService = { title: '', short_description: '', description: '', icon_or_image: 'hard-hat' }
const SECTIONS = ['dashboard', 'projects', 'services', 'enquiries']

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@srinidhiconstructions.in')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try { const result = await api.post('/auth/login', { email, password }); onLogin(result.data.data.admin) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to sign in. Check your credentials and try again.') }
    finally { setSubmitting(false) }
  }
  return <section className="admin-login"><div className="admin-login-box">
    <Link to="/" className="brand"><span className="brand-mark">S</span><span>Srinidhi<br /><b>Constructions</b></span></Link>
    <p className="eyebrow">Private workspace</p><h1>Welcome<br /><em>back.</em></h1>
    <form onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <p className="form-error">{error}</p>}
      <button className="button button-dark" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={17} /></button>
    </form>
  </div></section>
}

function Loading({ label }) {
  return <div className="admin-loading"><Loader2 className="spin" size={22} /><span>{label}</span></div>
}

function Empty({ icon: Icon, children }) {
  return <div className="admin-empty"><Icon size={22} /><p>{children}</p></div>
}

// No part of this app has an error boundary, so any uncaught render error
// (a bad API response shape, a stray null, etc.) used to unmount the whole
// React tree and leave a silent, fully blank page. This catches it, shows
// what actually broke, and resets whenever the admin navigates elsewhere.
class AdminErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('Admin panel crashed:', error, info) }
  render() {
    if (this.state.error) {
      return <section className="admin-login"><div className="admin-login-box">
        <p className="eyebrow">Something went wrong</p>
        <h1>Admin<br /><em>error.</em></h1>
        <p className="form-error">{this.state.error.message || String(this.state.error)}</p>
        <button className="button button-dark" onClick={() => window.location.reload()}>Reload <ArrowUpRight size={17} /></button>
      </div></section>
    }
    return this.props.children
  }
}

function AdminShell({ admin, onLogout, onSessionExpired }) {
  const location = useLocation()
  const navigate = useNavigate()
  const rawSection = location.pathname.split('/')[2] || 'dashboard'
  const section = SECTIONS.includes(rawSection) ? rawSection : 'dashboard'
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [serviceForm, setServiceForm] = useState(emptyService)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [notification, setNotification] = useState('')

  const showNotification = (message) => {
    setNotification(message)
    window.setTimeout(() => setNotification(''), 3000)
  }

  const fetchSection = (targetSection) => {
    if (targetSection === 'dashboard') return getDashboard()
    if (targetSection === 'projects') return getAdminProjects()
    if (targetSection === 'services') return getAdminServices()
    if (targetSection === 'enquiries') return getEnquiries()
    return Promise.resolve([])
  }

  const handleLoadError = (requestError) => {
    if (requestError.response?.status === 401) { onSessionExpired(); return true }
    setError(requestError.response?.data?.message || 'Could not load this workspace.')
    return false
  }

  // Clear any stale data from the previous section immediately so a
  // dashboard object can never be rendered by the projects/services/
  // enquiries list (which expects an array) while the new section loads.
  useEffect(() => {
    let active = true
    setData(null)
    setError('')
    fetchSection(section)
      .then((result) => { if (active) setData(result) })
      .catch((requestError) => { if (active) handleLoadError(requestError) })
    return () => { active = false }
  }, [section])

  const reload = async () => {
    try { setData(await fetchSection(section)) }
    catch (requestError) { handleLoadError(requestError) }
  }

  const remove = async (kind, id) => {
    if (!window.confirm('Delete this record permanently?')) return
    try {
      if (kind === 'project') await deleteProject(id)
      if (kind === 'service') await deleteService(id)
      if (kind === 'enquiry') await deleteEnquiry(id)
      await reload()
    } catch (requestError) { handleLoadError(requestError) }
  }

  const submitProject = async (event) => {
    event.preventDefault()
    if (!projectForm.cover_image) { setUploadError('Upload a cover image before saving.'); return }
    const wasEditing = !!editingProjectId
    try {
      await saveProject(projectForm, editingProjectId)
      setProjectForm(emptyProject); setEditingProjectId(null); setUploadError('')
      await reload()
      showNotification(wasEditing ? 'Project updated successfully!' : 'Project added successfully!')
    } catch (requestError) { handleLoadError(requestError) }
  }
  const editProject = (item) => { setEditingProjectId(item.id); setUploadError(''); setProjectForm({ title: item.title, category: item.category, status: item.status, location: item.location, area_sqft: item.area_sqft, description: item.description, cover_image: item.cover_image, is_featured: item.is_featured }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelProjectEdit = () => { setEditingProjectId(null); setProjectForm(emptyProject); setUploadError('') }

  const handleCoverUpload = async (file) => {
    setUploadError('')
    setUploading(true)
    try { const path = await uploadImage(file); setProjectForm((prev) => ({ ...prev, cover_image: path })) }
    catch (requestError) {
      if (requestError.response?.status === 401) { onSessionExpired(); return }
      setUploadError(requestError.response?.data?.errors?.image || requestError.response?.data?.message || 'Could not upload the image.')
    }
    finally { setUploading(false) }
  }

  const submitService = async (event) => {
    event.preventDefault()
    const wasEditing = !!editingServiceId
    try {
      await saveService(serviceForm, editingServiceId)
      setServiceForm(emptyService); setEditingServiceId(null)
      await reload()
      showNotification(wasEditing ? 'Service updated successfully!' : 'Service added successfully!')
    } catch (requestError) { handleLoadError(requestError) }
  }
  const editService = (item) => { setEditingServiceId(item.id); setServiceForm({ title: item.title, short_description: item.short_description, description: item.description, icon_or_image: item.icon_or_image }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelServiceEdit = () => { setEditingServiceId(null); setServiceForm(emptyService) }

  const nav = (path) => navigate(`/admin/${path}`)

  return <section className="admin-shell">
    {notification && (
      <div className="admin-toast" role="status" aria-live="polite">
        <span className="admin-toast-icon">✓</span>
        <span>{notification}</span>
        <button type="button" onClick={() => setNotification('')} aria-label="Close notification">×</button>
      </div>
    )}
    <aside className="admin-side">
      <Link to="/" className="brand"><span className="brand-mark">S</span><span>Srinidhi<br /><b>Constructions</b></span></Link>
      <div className="admin-nav">
        <button className={section === 'dashboard' ? 'selected' : ''} onClick={() => nav('dashboard')}><Settings2 size={16} /> Overview</button>
        <button className={section === 'projects' ? 'selected' : ''} onClick={() => nav('projects')}><BriefcaseBusiness size={16} /> Projects</button>
        <button className={section === 'services' ? 'selected' : ''} onClick={() => nav('services')}><ClipboardList size={16} /> Services</button>
        <button className={section === 'enquiries' ? 'selected' : ''} onClick={() => nav('enquiries')}><Inbox size={16} /> Enquiries</button>
      </div>
      <button className="signout" onClick={onLogout}><LogOut size={15} /> Sign out</button>
    </aside>
    <div className="admin-main">
      <div className="admin-top"><div><p className="eyebrow">Srinidhi / Admin</p><h1>{section === 'dashboard' ? 'Good morning.' : section[0].toUpperCase() + section.slice(1)}</h1></div><span className="admin-user">{admin.name}</span></div>
      {error && <p className="form-error">{error}</p>}
      {section === 'dashboard' && <Dashboard data={data} onEnquiries={() => nav('enquiries')} />}
      {section === 'projects' && <Projects data={data} form={projectForm} setForm={setProjectForm} onSubmit={submitProject} onDelete={(id) => remove('project', id)} onEdit={editProject} editingId={editingProjectId} onCancelEdit={cancelProjectEdit} uploading={uploading} uploadError={uploadError} onImageUpload={handleCoverUpload} />}
      {section === 'services' && <Services data={data} form={serviceForm} setForm={setServiceForm} onSubmit={submitService} onDelete={(id) => remove('service', id)} onEdit={editService} editingId={editingServiceId} onCancelEdit={cancelServiceEdit} />}
      {section === 'enquiries' && <Enquiries data={data} onStatus={async (id, status) => { try { await updateEnquiry(id, status); await reload() } catch (requestError) { handleLoadError(requestError) } }} onDelete={(id) => remove('enquiry', id)} />}
    </div>
  </section>
}

function Dashboard({ data, onEnquiries }) {
  if (!data) return <Loading label="Loading workspace…" />
  return <>
    <div className="admin-stats">
      <div><span>Total projects</span><strong>{data.projects}</strong></div>
      <div><span>Total services</span><strong>{data.services}</strong></div>
      <div><span>New enquiries</span><strong>{data.new_enquiries}</strong></div>
      <div><span>Recent enquiries</span><strong>{data.recent_enquiries}</strong></div>
    </div>
    <div className="admin-panel">
      <div className="panel-heading"><h2>Recent enquiries</h2><button className="text-link" onClick={onEnquiries}>View all <ArrowUpRight size={15} /></button></div>
      {data.recent.length === 0 && <Empty icon={Inbox}>No enquiries yet.</Empty>}
      {data.recent.map((item) => <div className="admin-row" key={item.id}><span className="admin-dot orange" /><div><b>{item.name} · {item.subject}</b><small>{item.email} · {item.status}</small></div></div>)}
    </div>
  </>
}

function Projects({ data, form, setForm, onSubmit, onDelete, onEdit, editingId, onCancelEdit, uploading, uploadError, onImageUpload }) {
  return <>
    <div className="admin-panel admin-form-panel">
      <div className="panel-heading"><h2>{editingId ? 'Edit project' : 'Add project'}</h2>{editingId ? <button type="button" className="icon-action" onClick={onCancelEdit} aria-label="Cancel edit"><X size={16} /></button> : <Plus size={18} />}</div>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label>Title<input required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Location<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
        </div>
        <div className="form-row">
          <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="residential">residential</option><option value="commercial">commercial</option><option value="industrial">industrial</option></select></label>
          <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ongoing">ongoing</option><option value="completed">completed</option><option value="upcoming">upcoming</option></select></label>
        </div>
        <label>Area (sq ft)<input required type="number" min="1" value={form.area_sqft} onChange={(e) => setForm({ ...form, area_sqft: e.target.value })} /></label>
        <label>Cover image
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files[0] && onImageUpload(e.target.files[0])} />
        </label>
        {uploading && <p className="form-hint"><Upload size={13} /> Uploading image…</p>}
        {uploadError && <p className="form-error">{uploadError}</p>}
        {form.cover_image && !uploading && <img className="admin-image-preview" src={resolveImage(form.cover_image)} alt="Cover preview" />}
        <label>Description<textarea required maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <button className="button button-orange" disabled={uploading || !form.cover_image}>{editingId ? 'Save changes' : 'Create project'} <ArrowUpRight size={16} /></button>
      </form>
    </div>
    <div className="admin-panel">
      <div className="panel-heading"><h2>Published projects <small>{data ? data.length : 0}</small></h2></div>
      {data === null && <Loading label="Loading projects…" />}
      {data !== null && data.length === 0 && <Empty icon={BriefcaseBusiness}>No projects yet — add your first project above.</Empty>}
      {data !== null && data.map((item) => <div className="admin-row" key={item.id}>
        <img src={resolveImage(item.cover_image)} alt="" />
        <div><b>{item.title}</b><small>{item.location} · {item.category} · {item.status}</small></div>
        <button className="icon-action" aria-label={`Edit ${item.title}`} onClick={() => onEdit(item)}><Pencil size={15} /></button>
        <button className="icon-action" aria-label={`Delete ${item.title}`} onClick={() => onDelete(item.id)}><Trash2 size={15} /></button>
      </div>)}
    </div>
  </>
}

function Services({ data, form, setForm, onSubmit, onDelete, onEdit, editingId, onCancelEdit }) {
  return <>
    <div className="admin-panel admin-form-panel">
      <div className="panel-heading"><h2>{editingId ? 'Edit service' : 'Add service'}</h2>{editingId ? <button type="button" className="icon-action" onClick={onCancelEdit} aria-label="Cancel edit"><X size={16} /></button> : <Plus size={18} />}</div>
      <form onSubmit={onSubmit}>
        <label>Title<input required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Short description<input required maxLength={255} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></label>
        <label>Description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <button className="button button-orange">{editingId ? 'Save changes' : 'Create service'} <ArrowUpRight size={16} /></button>
      </form>
    </div>
    <div className="admin-panel">
      <div className="panel-heading"><h2>Services <small>{data ? data.length : 0}</small></h2></div>
      {data === null && <Loading label="Loading services…" />}
      {data !== null && data.length === 0 && <Empty icon={ClipboardList}>No services yet — add your first service above.</Empty>}
      {data !== null && data.map((item) => <div className="admin-row" key={item.id}>
        <div><b>{item.title}</b><small>{item.short_description}</small></div>
        <button className="icon-action" aria-label={`Edit ${item.title}`} onClick={() => onEdit(item)}><Pencil size={15} /></button>
        <button className="icon-action" aria-label={`Delete ${item.title}`} onClick={() => onDelete(item.id)}><Trash2 size={15} /></button>
      </div>)}
    </div>
  </>
}

function Enquiries({ data, onStatus, onDelete }) {
  return <div className="admin-panel">
    <div className="panel-heading"><h2>Enquiries <small>{data ? data.length : 0} total</small></h2></div>
    {data === null && <Loading label="Loading enquiries…" />}
    {data !== null && data.length === 0 && <Empty icon={Inbox}>No enquiries yet.</Empty>}
    {data !== null && data.map((item) => <div className="admin-row" key={item.id}>
      <span className={`admin-dot ${item.status === 'new' ? 'orange' : ''}`} />
      <div><b>{item.name} · {item.subject}</b><small>{item.email} · {item.phone} · {new Date(item.created_at).toLocaleDateString('en-IN')}</small><p className="admin-message">{item.message}</p></div>
      <select value={item.status} onChange={(e) => onStatus(item.id, e.target.value)}><option value="new">New</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select>
      <button className="icon-action" aria-label={`Delete enquiry from ${item.name}`} onClick={() => onDelete(item.id)}><Trash2 size={15} /></button>
    </div>)}
  </div>
}

export default function Admin() {
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)
  const location = useLocation()

  // Verify the session exactly once, on mount. Re-running this on every
  // sidebar click (as a `[location.pathname]` dependency would) tore down
  // the whole admin shell and flashed a full-screen "Checking session…"
  // loader on every navigation.
  useEffect(() => {
    let active = true
    adminVerify()
      .then((result) => { if (active) setAdmin(result.admin) })
      .catch(() => { if (active) setAdmin(null) })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])

  const logout = async () => { await logoutAdmin(); setAdmin(null) }
  const sessionExpired = () => setAdmin(null)

  if (checking) return <section className="admin-login"><Loading label="Checking session…" /></section>
  if (!admin) return location.pathname === '/admin/login' ? <Login onLogin={setAdmin} /> : <Navigate to="/admin/login" replace />

  // Signed in but sitting on /admin or /admin/login (e.g. right after a
  // successful sign-in): send to the dashboard instead of rendering the
  // shell with an unrecognised "login" section, which produced a blank
  // page with "Login" as its heading.
  if (location.pathname === '/admin/login' || location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <AdminErrorBoundary key={location.pathname}><AdminShell admin={admin} onLogout={logout} onSessionExpired={sessionExpired} /></AdminErrorBoundary>
}