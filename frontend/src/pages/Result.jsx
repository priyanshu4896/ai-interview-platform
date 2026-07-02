import { ArrowRight, Award, CheckCircle2, MessageSquareText, RotateCcw, Target, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios'
import Loader from '../components/Loader'
import { ErrorMessage } from './Login'

export default function Result() {
  const { id } = useParams()
  const location = useLocation()
  const [interview, setInterview] = useState(location.state?.interview || null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!interview) api.get(`/interviews/${id}`).then(({ data }) => setInterview(data)).catch((requestError) => setError(getErrorMessage(requestError)))
  }, [id, interview])

  if (error) return <main className="shell py-10"><ErrorMessage text={error} /></main>
  if (!interview) return <Loader label="Preparing your performance report..." />

  const scoredQuestions = interview.questions.filter((item) => item.evaluation)
  const bestScore = scoredQuestions.length ? Math.max(...scoredQuestions.map((item) => item.evaluation.score)) : 0
  const percentage = Math.min(100, interview.average_score * 10)

  return <main className="shell max-w-6xl py-10">
    <section className="card relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-violet-400 to-cyan" />
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div><div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={20} /><span className="text-sm font-semibold">Interview complete</span></div><p className="eyebrow mt-6">{interview.category} performance report</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">A solid step toward <span className="gradient-text">interview confidence.</span></h1><p className="mt-4 max-w-2xl leading-7 text-slate-400">Review the coach’s notes question by question. Focus on one improvement at a time, then practice again while the feedback is fresh.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/interview/setup" className="btn-primary"><RotateCcw size={17} /> Practice again</Link><Link to="/history" className="btn-secondary">View history <ArrowRight size={17} /></Link></div></div>
        <div className="mx-auto grid h-44 w-44 place-items-center rounded-full p-3" style={{ background: `conic-gradient(#7c5cff ${percentage}%, #222a3a ${percentage}% 100%)` }}><div className="grid h-full w-full place-items-center rounded-full bg-panel text-center"><span><strong className="text-5xl">{interview.average_score}</strong><small className="block text-slate-500">out of 10</small></span></div></div>
      </div>
    </section>

    <section className="mt-5 grid gap-4 sm:grid-cols-3">
      <Summary icon={Target} label="Questions answered" value={`${scoredQuestions.length}/${interview.question_count}`} />
      <Summary icon={TrendingUp} label="Average score" value={`${interview.average_score}/10`} />
      <Summary icon={Award} label="Best response" value={`${bestScore}/10`} />
    </section>

    <div className="mt-8 flex items-end justify-between"><div><p className="eyebrow">Detailed coaching</p><h2 className="section-title mt-2">Question-by-question review</h2></div><span className="hidden text-sm text-slate-500 sm:block">{scoredQuestions.length} responses evaluated</span></div>
    <div className="mt-5 space-y-5">{interview.questions.map((item) => <article className="card overflow-hidden !p-0" key={item.question_number}><div className="flex items-start justify-between gap-5 border-b border-line p-6"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-400">Question {item.question_number}</p><h3 className="mt-2 text-lg font-semibold leading-7">{item.question}</h3></div><ScoreBadge score={item.evaluation?.score} /></div><div className="p-6"><div className="rounded-xl bg-ink/60 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your answer</p><p className="mt-2 text-sm leading-6 text-slate-300">{item.answer}</p></div><div className="grid gap-4 lg:grid-cols-2"><Feedback title="Coach feedback" text={item.evaluation?.feedback} /><Feedback title="Communication" text={item.evaluation?.communication_feedback} /><div className="lg:col-span-2"><Feedback title="A stronger answer" text={item.evaluation?.better_answer} highlight /></div></div></div></article>)}</div>
  </main>
}

function Summary({ icon: Icon, label, value }) {
  return <div className="card card-hover !p-5"><Icon className="text-violet-400" size={20} /><p className="mt-4 text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>
}

function ScoreBadge({ score = 0 }) {
  const color = score >= 8 ? 'text-emerald-300 bg-emerald-500/10' : score >= 6 ? 'text-amber-300 bg-amber-500/10' : 'text-red-300 bg-red-500/10'
  return <span className={`shrink-0 rounded-xl px-3 py-2 font-bold ${color}`}>{score}/10</span>
}

function Feedback({ title, text, highlight }) {
  return <div className={`mt-4 h-full rounded-xl border p-4 ${highlight ? 'border-violet-500/20 bg-violet-500/5' : 'border-line'}`}><p className="flex items-center gap-2 text-sm font-semibold"><MessageSquareText size={15} className={highlight ? 'text-violet-400' : 'text-cyan'} />{title}</p><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>
}
