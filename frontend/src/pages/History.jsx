import { ArrowRight, CalendarDays, FileSearch, MessageSquareText, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios'
import Loader from '../components/Loader'
import Toast from '../components/Toast'

export default function History() {
  const [tab, setTab] = useState('interviews')
  const [interviews, setInterviews] = useState([])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/interviews'), api.get('/resumes')])
      .then(([interviewResponse, resumeResponse]) => {
        setInterviews(interviewResponse.data)
        setResumes(resumeResponse.data)
      })
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader label="Loading your progress..." />
  const items = tab === 'interviews' ? interviews : resumes

  return <main className="shell py-10">
    <Toast message={error} type="error" onClose={() => setError('')} />
    <p className="eyebrow">Progress archive</p><h1 className="mt-2 text-4xl font-bold">Your practice history</h1>
    <div className="mt-7 inline-flex rounded-xl border border-line bg-panel p-1"><button onClick={() => setTab('interviews')} className={`rounded-lg px-4 py-2 text-sm transition ${tab === 'interviews' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}>Interviews ({interviews.length})</button><button onClick={() => setTab('resumes')} className={`rounded-lg px-4 py-2 text-sm transition ${tab === 'resumes' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}>Resumes ({resumes.length})</button></div>

    <section className="mt-6 space-y-4">
      {items.length === 0
        ? <EmptyState type={tab} />
        : tab === 'interviews'
          ? interviews.map((item) => <Link to={item.status === 'completed' ? `/result/${item.id}` : `/interview/${item.id}`} key={item.id} className="card card-hover flex items-center justify-between gap-5"><div className="flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-400"><MessageSquareText /></span><div><h2 className="font-semibold">{item.category} interview</h2><p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={13} /> {new Date(item.created_at).toLocaleString()} · {item.status.replace('_', ' ')}</p></div></div><div className="flex items-center gap-4"><strong>{item.status === 'completed' ? `${item.average_score}/10` : `${item.current_question_index}/${item.question_count}`}</strong><ArrowRight size={17} className="text-slate-600" /></div></Link>)
          : resumes.map((item) => <article key={item.id} className="card card-hover flex items-center justify-between gap-5"><div className="flex min-w-0 items-center gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan/10 text-cyan"><FileSearch /></span><div className="min-w-0"><h2 className="truncate font-semibold">{item.filename}</h2><p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p></div></div><strong>{item.analysis.ats_score}/100</strong></article>)}
    </section>
  </main>
}

function EmptyState({ type }) {
  const isInterview = type === 'interviews'
  const Icon = isInterview ? MessageSquareText : FileSearch
  return <div className="card py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-slate-400"><Icon /></span><h2 className="mt-5 text-xl font-bold">{isInterview ? 'No interviews yet' : 'No resume analyses yet'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{isInterview ? 'Complete your first practice interview to start tracking scores and improvement.' : 'Upload a resume or paste its text to create your first ATS analysis.'}</p><Link to={isInterview ? '/interview/setup' : '/resume'} className="btn-primary mt-6"><Plus size={17} /> {isInterview ? 'Start an interview' : 'Analyze a resume'}</Link></div>
}
