import * as Icons from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function ServiceCard({ service, index }) { const Icon = Icons[service.icon_or_image] || Icons.HardHat; return <article className="service-card"><div className="service-number">0{index + 1}</div><Icon size={29} strokeWidth={1.4} /><h3>{service.title}</h3><p>{service.short_description}</p><Link to={`/services/${service.slug}`}>Discover capability <ArrowUpRight size={15} /></Link></article> }
