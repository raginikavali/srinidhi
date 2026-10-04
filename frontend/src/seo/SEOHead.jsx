import { Helmet } from 'react-helmet-async'
export default function SEOHead({ title, description, path = '', schema }) {
  const canonical = `https://srinidhiconstructions.in${path}`
  return <Helmet><title>{title} | Srinidhi Constructions</title><meta name="description" content={description} /><link rel="canonical" href={canonical} /><meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:type" content="website" /><meta property="og:url" content={canonical} />{schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}</Helmet>
}
