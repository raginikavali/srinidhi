import { motion } from 'framer-motion'
export const reveal = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: .65, ease: [0.22, 1, .36, 1] } } }
export const stagger = { hidden: {}, show: { transition: { staggerChildren: .11 } } }
export default function PageMotion({ children, className = '' }) { return <motion.div className={className} initial="hidden" animate="show" variants={stagger}>{children}</motion.div> }
export function Reveal({ children, className = '' }) { return <motion.div className={className} variants={reveal}>{children}</motion.div> }
