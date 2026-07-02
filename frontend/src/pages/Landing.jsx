import { ArrowRight, FileSearch, MessageSquareText, Mic, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  { icon: MessageSquareText, title: 'Role-specific practice', text: 'Practice HR, Python, JavaScript, React, Node.js, and MongoDB interviews.' },
  { icon: Mic, title: 'Speak naturally', text: 'Use browser voice recognition or type your answer—whichever helps you practice best.' },
  { icon: FileSearch, title: 'Resume intelligence', text: 'Get an ATS score, strengths, gaps, and a stronger professional summary.' },
]

export default function Landing() {
  return (
    <main>
      <section className="shell flex min-h-[78vh] flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-300"><Sparkles size={15} /> Your private AI interview coach</div>
        <h1 className="max-w-5xl text-5xl font-extrabold tracking-tight sm:text-7xl">Walk into your next interview <span className="gradient-text">ready.</span></h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">Practice realistic questions, receive candid feedback, and turn every answer into a stronger one.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to="/register" className="btn-primary">Start practicing free <ArrowRight size={18} /></Link><Link to="/login" className="btn-secondary">I have an account</Link></div>
      </section>
      <section className="shell grid gap-5 pb-24 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => <article key={title} className="card"><Icon className="mb-5 text-cyan" /><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-slate-400">{text}</p></article>)}
      </section>
    </main>
  )
}
