import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Check, MoveRight } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SEOHead from '../seo/SEOHead'
import ServiceCard from '../components/ServiceCard'
import ProjectCard from '../components/ProjectCard'
import AnimatedCounter from '../components/AnimatedCounter'
import { getProjects, getServices, resolveImage } from '../api/client'
import { useEffect, useRef, useState } from 'react'

const VALUES = ['Safety first', 'Built on trust', 'On-time delivery', 'Honest communication', 'Quality craftsmanship', 'Client-led design']
const ACCREDITATIONS = ['ISO 9001:2015 Certified', 'RERA Registered', 'IGBC Green Building Partner', 'Member, CREDAI Bengaluru']

function ValuesMarquee() {
  const track = [...VALUES, ...VALUES]
  return (
    <div className="marquee">
      <motion.div className="marquee-track" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 22, ease: 'linear', repeat: Infinity }}>
        {track.map((v, i) => <span key={i}>{v} <em>—</em></span>)}
      </motion.div>
    </div>
  )
}

function FeaturedSpotlight({ project }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  if (!project) return null
  return (
    <section className="container spotlight" ref={ref}>
      <div className="section-heading"><div><p className="eyebrow">03 / Featured project</p><h2>Our most recent handover.</h2></div><Link className="text-link" to="/projects">View portfolio <MoveRight size={18} /></Link></div>
      <Link to={`/projects/${project.slug}`} className="spotlight-frame">
        <motion.img src={resolveImage(project.cover_image)} alt={project.title} style={{ y }} />
        <div className="spotlight-overlay" />
        <div className="spotlight-caption">
          <span className="project-status">{project.status}</span>
          <h3>{project.title}</h3>
          <p>{project.location} · {Number(project.area_sqft).toLocaleString('en-IN')} sq ft</p>
        </div>
      </Link>
    </section>
  )
}

export default function Home() { const [services, setServices] = useState([]); const [projects, setProjects] = useState([]); useEffect(() => { getServices().then(setServices); getProjects({ featured: 1 }).then((r) => setProjects(r.items || [])) }, []); const schema = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Srinidhi Constructions', url: 'https://srinidhiconstructions.in', address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' } }; return <>
  <SEOHead title="Built for the life ahead" description="Srinidhi Constructions creates enduring homes, workplaces and developments across Bengaluru with clarity and care." schema={schema} />
  <section className="hero"><div className="hero-image" /><div className="hero-overlay" /><div className="container hero-content"><motion.p className="kicker" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>Bengaluru · Est. 2008</motion.p><motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}>We build the<br /><em>spaces</em> life needs.</motion.h1><motion.p className="hero-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25 }}>Construction with a point of view. From considered homes to high-performing workplaces, we make places that feel right for a long time.</motion.p><Link className="button button-light" to="/projects">See our work <ArrowUpRight size={17} /></Link></div><div className="hero-scroll"><ArrowDownRight size={17} /> Scroll to explore</div></section>
  <ValuesMarquee />
  <section className="intro container split-section"><div><p className="eyebrow">01 / The Srinidhi way</p><h2>Good buildings begin with good questions.</h2></div><div><p className="lead">We are a construction and development company for people who care about the details. Our work pairs rigorous delivery with a human understanding of how a place should feel.</p><Link className="text-link" to="/about">More about Srinidhi <MoveRight size={18} /></Link></div></section>
  <section className="stats-band"><div className="container stats-grid"><AnimatedCounter value="16" suffix=" yrs" label="building with intent" /><AnimatedCounter value="72" suffix="+" label="projects delivered" /><AnimatedCounter value="1.8" suffix="M sq ft" label="spaces brought to life" /><AnimatedCounter value="98" suffix="%" label="referral-led work" /></div></section>
  <section className="container section"><div className="section-heading"><div><p className="eyebrow">02 / What we do</p><h2>Built around your ambition.</h2></div><Link className="text-link" to="/services">All capabilities <MoveRight size={18} /></Link></div><div className="service-grid">{services.slice(0, 4).map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}</div></section>
  <FeaturedSpotlight project={projects[0]} />
  <section className="container section projects-section"><div className="section-heading"><div><p className="eyebrow">03a / More selected work</p><h2>Made in Bengaluru.</h2></div></div><div className="projects-grid">{projects.slice(1, 4).map((p) => <ProjectCard key={p.id} project={p} featured />)}</div></section>
  <section className="belief container"><div className="belief-image"><img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=85" alt="Construction team reviewing plans on site" /></div><div className="belief-copy"><p className="eyebrow">04 / Why Srinidhi</p><h2>Less noise.<br /><em>More building.</em></h2><p>Clear scope. Honest updates. Skilled hands. We keep the process legible so you can stay focused on the bigger picture.</p><ul><li><Check size={17} /> One accountable team from brief to handover</li><li><Check size={17} /> Site-first decisions and dependable timelines</li><li><Check size={17} /> Materials chosen for the years ahead</li></ul><Link className="button button-dark" to="/contact">Start a project <ArrowUpRight size={17} /></Link></div></section>
  <section className="trust-band"><div className="container trust-row"><span className="trust-label">Accredited &amp; recognised</span>{ACCREDITATIONS.map((a) => <span key={a}>{a}</span>)}</div></section>
  <section className="closing-cta"><div className="container"><p className="eyebrow">Have a site, a sketch, or just a question?</p><h2>Let’s make room<br /><em>for what’s next.</em></h2><Link className="button button-orange" to="/contact">Talk to our team <ArrowUpRight size={17} /></Link></div></section>
</> }