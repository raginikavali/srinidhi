import { Link } from 'react-router-dom'
export default function NotFound() { return <section className="page-hero not-found"><div className="container"><p className="eyebrow">404 / Page not found</p><h1>Looks like this<br /><em>space is empty.</em></h1><Link to="/" className="button button-dark">Back to home</Link></div></section> }
