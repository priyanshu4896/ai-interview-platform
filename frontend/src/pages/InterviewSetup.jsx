import { ArrowLeft, ArrowRight, BriefcaseBusiness, Code2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios'
import { InlineSpinner } from '../components/Loader'
import Toast from '../components/Toast'

const categories = ['HR', 'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB']
export default function InterviewSetup() {
  const [category, setCategory] = useState('HR'); const [count, setCount] = useState(5); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const navigate = useNavigate()
  const start = async () => { setLoading(true); setError(''); try { const { data } = await api.post('/interviews/start', { category, question_count: count }); navigate(`/interview/${data.interview.id}`, { state: data }) } catch (err) { setError(getErrorMessage(err)); setLoading(false) } }
  return <main className="shell max-w-4xl py-10"><Toast message={error} type="error" onClose={() => setError('')} /><Link to="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> Dashboard</Link><p className="eyebrow">Practice setup</p><h1 className="mt-2 text-4xl font-bold">What are we preparing for?</h1><p className="mt-3 text-slate-400">Choose a track and session length. Each answer receives immediate coaching.</p>
    <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-2xl border p-5 text-left transition ${category === item ? 'border-accent bg-accent/10' : 'border-line bg-panel/70 hover:border-slate-600'}`}>{item === 'HR' ? <BriefcaseBusiness className="mb-5 text-cyan" /> : <Code2 className="mb-5 text-violet-400" />}<span className="font-semibold">{item}</span><span className="mt-1 block text-xs text-slate-500">{item === 'HR' ? 'Behavioral & situational' : 'Technical knowledge'}</span></button>)}</section>
    <section className="card mt-6"><label className="label">Number of questions: <strong className="text-white">{count}</strong></label><input className="mt-3 w-full accent-violet-500" type="range" min="3" max="10" value={count} onChange={(e) => setCount(Number(e.target.value))} /><div className="mt-2 flex justify-between text-xs text-slate-600"><span>3 — quick</span><span>10 — deep practice</span></div></section>
    <button onClick={start} disabled={loading} className="btn-primary mt-6 w-full sm:w-auto">{loading && <InlineSpinner />}{loading ? 'Generating first question...' : 'Begin interview'} {!loading && <ArrowRight size={18} />}</button>
  </main>
}
