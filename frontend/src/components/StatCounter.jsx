import { motion } from 'framer-motion'
export default function StatCounter({ value, suffix = '', label }) { return <motion.div className="stat" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}><strong>{value}<small>{suffix}</small></strong><span>{label}</span></motion.div> }
