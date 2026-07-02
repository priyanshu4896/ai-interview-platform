import { Mic, MicOff, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios'
import Loader from '../components/Loader'
import { InlineSpinner } from '../components/Loader'
import Toast from '../components/Toast'
import { ErrorMessage } from './Login'

export default function InterviewRoom() {
  const { id } = useParams(); const location = useLocation(); const navigate = useNavigate()
  const [interview, setInterview] = useState(location.state?.interview || null); const [answer, setAnswer] = useState(''); const [evaluation, setEvaluation] = useState(null); const [loading, setLoading] = useState(!location.state?.interview); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(''); const [toast, setToast] = useState(''); const [listening, setListening] = useState(false); const recognitionRef = useRef(null)
  useEffect(() => { if (!interview) api.get(`/interviews/${id}`).then(({ data }) => { if (data.status === 'completed') navigate(`/result/${id}`, { replace: true }); else setInterview(data) }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false)) }, [id, interview, navigate])
  useEffect(() => () => recognitionRef.current?.stop(), [])
  if (loading) return <Loader label="Loading interview..." />
  if (!interview) return <main className="shell py-10"><ErrorMessage text={error || 'Interview not found'} /></main>
  const current = interview.questions[interview.current_question_index]
  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) { setError('Voice recognition is not supported in this browser. Try Chrome or Edge.'); return }
    const recognition = new Recognition(); recognition.lang = 'en-US'; recognition.continuous = true; recognition.interimResults = true
    let baseAnswer = answer
    recognition.onresult = (event) => { let finalText = ''; let interimText = ''; for (let i = event.resultIndex; i < event.results.length; i += 1) { const text = event.results[i][0].transcript; if (event.results[i].isFinal) finalText += text; else interimText += text } if (finalText) baseAnswer = `${baseAnswer} ${finalText}`.trim(); setAnswer(`${baseAnswer} ${interimText}`.trim()) }
    recognition.onerror = () => { setListening(false); setError('Microphone recognition stopped. Check browser microphone permission.') }; recognition.onend = () => setListening(false); recognition.start(); recognitionRef.current = recognition; setListening(true); setError('')
  }
  const submit = async () => { if (!answer.trim()) return; recognitionRef.current?.stop(); setSubmitting(true); setError(''); try { const { data } = await api.post(`/interviews/${id}/answer`, { answer: answer.trim() }); setEvaluation(data.evaluation); setInterview(data.interview); if (data.completed) navigate(`/result/${id}`, { state: { interview: data.interview } }); else { setAnswer(''); setToast(`Answer evaluated: ${data.evaluation.score}/10. Next question ready.`) } } catch (err) { setError(getErrorMessage(err)) } finally { setSubmitting(false) } }
  return <main className="shell max-w-5xl py-10"><Toast message={error} type="error" onClose={() => setError('')} /><Toast message={toast} type="success" onClose={() => setToast('')} /><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">{interview.category} interview</p><h1 className="mt-2 text-2xl font-bold">Question {interview.current_question_index + 1} of {interview.question_count}</h1></div><span className="rounded-full border border-line px-4 py-2 text-sm text-slate-400">AI interviewer</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan transition-all" style={{ width: `${((interview.current_question_index + 1) / interview.question_count) * 100}%` }} /></div>
    <section className="card mt-8"><p className="text-sm text-slate-500">Interviewer</p><h2 className="mt-3 text-xl font-semibold leading-8 sm:text-2xl">{current?.question}</h2></section>
    {evaluation && <section className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"><div className="flex items-center justify-between"><strong className="text-emerald-300">Previous answer evaluated</strong><span className="font-bold">{evaluation.score}/10</span></div><p className="mt-2 text-sm text-slate-400">{evaluation.feedback}</p></section>}
    <section className="mt-6"><label className="label">Your answer</label><textarea className="input min-h-48 resize-y leading-7" placeholder="Structure your thoughts and answer as if you were speaking to the interviewer..." value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={submitting} /><div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row"><button onClick={toggleVoice} disabled={submitting} className={listening ? 'btn-secondary border-red-400/40 text-red-300' : 'btn-secondary'}>{listening ? <MicOff size={18} /> : <Mic size={18} />}{listening ? 'Stop listening' : 'Answer by voice'}</button><button onClick={submit} disabled={submitting || !answer.trim()} className="btn-primary">{submitting && <InlineSpinner />}{submitting ? 'Evaluating answer...' : 'Submit answer'} {!submitting && <Send size={17} />}</button></div></section>
  </main>
}
