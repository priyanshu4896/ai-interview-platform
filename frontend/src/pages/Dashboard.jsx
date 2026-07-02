import { ArrowRight, BarChart3, FileSearch, History, MessageSquareText, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const [interviews, setInterviews] = useState([])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(location.state?.toast || '')

  useEffect(() => {
    Promise.all([api.get('/interviews'), api.get('/resumes')])
      .then(([interviewResponse, resumeResponse]) => {
        setInterviews(interviewResponse.data)
        setResumes(resumeResponse.data)
      })
      .catch((error) => setToast(getErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [])

  const completed = interviews.filter((item) => item.status === 'completed')
  const average = completed.length
    ? (completed.reduce((sum, item) => sum + item.average_score, 0) / completed.length).toFixed(1)
    : null
  const best = completed.length ? Math.max(...completed.map((item) => item.average_score)).toFixed(1) : null
  const latestResumeScore = resumes[0]?.analysis?.ats_score
  const toastIsSuccess = toast.toLowerCase().includes('welcome') || toast.toLowerCase().includes('created')

  return <main className="shell py-10">
    <Toast message={toast} type={toastIsSuccess ? 'success' : 'error'} onClose={() => setToast('')} />
    <p className="eyebrow">Your command center</p>
    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Ready when you are, {user?.name?.split(' ')[0]}.</h1>
    <p className="mt-3 text-slate-400">Pick a focused practice session or tune up your resume.</p>

    <section className="mt-9 grid gap-5 lg:grid-cols-2">
      <Link to="/interview/setup" className="card card-hover group hover:border-violet-500/40">
        <MessageSquareText className="text-violet-400" size={30} />
        <h2 className="mt-8 text-2xl font-bold">Start an AI interview</h2>
        <p className="mt-2 text-slate-400">Choose a role, answer realistic questions, and get detailed coaching.</p>
        <span className="mt-8 flex items-center gap-2 font-semibold text-violet-400">Choose category <ArrowRight className="transition group-hover:translate-x-1" size={18} /></span>
      </Link>
      <Link to="/resume" className="card card-hover group hover:border-cyan/40">
        <FileSearch className="text-cyan" size={30} />
        <h2 className="mt-8 text-2xl font-bold">Analyze your resume</h2>
        <p className="mt-2 text-slate-400">Upload a PDF or image for an ATS score, skill gaps, and actionable improvements.</p>
        <span className="mt-8 flex items-center gap-2 font-semibold text-cyan">Upload resume <ArrowRight className="transition group-hover:translate-x-1" size={18} /></span>
      </Link>
    </section>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={History} label="Total interviews" value={loading ? '...' : interviews.length} />
      <Stat icon={BarChart3} label="Average score" value={loading ? '...' : average ? `${average}/10` : '—'} />
      <Stat icon={Trophy} label="Best score" value={loading ? '...' : best ? `${best}/10` : '—'} />
      <Stat icon={FileSearch} label="Latest resume ATS" value={loading ? '...' : latestResumeScore == null ? '—' : `${latestResumeScore}/100`} />
    </section>
  </main>
}

function Stat({ icon: Icon, label, value }) {
  return <div className="card card-hover !p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><Icon className="text-violet-300" size={20} /></span><p className="mt-5 text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>
}
