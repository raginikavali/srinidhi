import { useState } from 'react'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'
import SEOHead from '../seo/SEOHead'
import { submitEnquiry } from '../api/client'

const NAME_RE = /^[\p{L} ]{2,60}$/u
const EMAIL_RE = /^[^\s@]+@gmail\.com$/i
const PHONE_RE = /^(?:\+91[ -]?)?[6-9]\d{9}$/

function validate(form) {
  const errors = {}
  if (!NAME_RE.test(form.name.trim())) errors.name = 'Enter a valid name (2-60 letters).'
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Please use a Gmail address (e.g. name@gmail.com).'
  if (!PHONE_RE.test(form.phone.replace(/\s+/g, ''))) errors.phone = 'Enter a valid 10-digit Indian mobile number.'
  if (form.subject.trim().length < 3 || form.subject.trim().length > 100) errors.subject = 'Subject must be 3-100 characters.'
  if (form.message.trim().length < 10 || form.message.trim().length > 1000) errors.message = 'Message must be 10-1000 characters.'
  return errors
}

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) { setError('Please correct the highlighted fields.'); return }
    setSubmitting(true)
    try {
      await submitEnquiry(form)
      setSent(true)
    } catch (requestError) {
      console.error('Enquiry submission failed', requestError)
      setFieldErrors(requestError.response?.data?.errors || {})
      setError(requestError.response?.data?.message || 'The enquiry could not be saved. Check that the PHP API and database are running, then try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return <><SEOHead title="Start a conversation" description="Tell Srinidhi Constructions about your next residential, commercial or interior project." path="/contact" /><section className="page-hero contact-hero"><div className="container"><p className="eyebrow">Contact</p><h1>Let’s talk<br /><em>about your space.</em></h1><p className="page-intro">Bring us a brief, a sketch, or a half-formed idea. We’ll bring thoughtful questions and a practical next step.</p></div></section><section className="container contact-grid"><div className="contact-info"><p className="eyebrow">Find us here</p><h2>Good conversations<br />start in person.</h2><p>12, 2nd Cross, Koramangala 3rd Block<br />Bengaluru 560034, Karnataka</p><a href="mailto:hello@srinidhiconstructions.in">hello@srinidhiconstructions.in</a><a href="tel:+918012345678">+91 80 1234 5678</a><div className="map-placeholder">Bengaluru <span>12.9352° N · 77.6245° E</span></div></div><div className="form-wrap">{sent ? <div className="success"><CheckCircle2 size={42} /><h2>Thanks, {form.name.split(' ')[0]}.</h2><p>Your enquiry is saved. Our team will contact you within one working day.</p></div> : <form onSubmit={submit} noValidate><div className="form-row"><label>Name<input name="name" value={form.name} onChange={update} placeholder="Your name" />{fieldErrors.name && <small className="form-error">{fieldErrors.name}</small>}</label><label>Email<input name="email" type="email" value={form.email} onChange={update} placeholder="you@gmail.com" />{fieldErrors.email && <small className="form-error">{fieldErrors.email}</small>}</label></div><div className="form-row"><label>Phone<input name="phone" value={form.phone} onChange={update} placeholder="+91 98765 43210" />{fieldErrors.phone && <small className="form-error">{fieldErrors.phone}</small>}</label><label>Subject<input name="subject" value={form.subject} onChange={update} placeholder="What are you building?" />{fieldErrors.subject && <small className="form-error">{fieldErrors.subject}</small>}</label></div><label>Message<textarea name="message" value={form.message} onChange={update} placeholder="Tell us a little about your project..." />{fieldErrors.message && <small className="form-error">{fieldErrors.message}</small>}</label>{error && <p className="form-error">{error}</p>}<button className="button button-dark" type="submit" disabled={submitting}>{submitting ? 'Saving enquiry…' : 'Send enquiry'} {!submitting && <ArrowUpRight size={17} />}</button></form>}</div></section></>
}