import { FileText, Sparkles, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import api, { getErrorMessage } from '../api/axios'
import { InlineSpinner } from '../components/Loader'
import Toast from '../components/Toast'
import { ErrorMessage } from './Login'

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const inputRef = useRef(null)
  const textRef = useRef(null)

  const pickFile = (selected) => {
    setError('')
    if (!selected) return
    const extension = selected.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) return setError('Please select a PDF, JPG, JPEG, or PNG resume.')
    if (selected.size > 5 * 1024 * 1024) return setError('Resume file must be 5 MB or smaller.')
    setFile(selected)
    setResult(null)
  }

  const submitAnalysis = async (source) => {
    const body = new FormData()
    if (source === 'file') body.append('file', file)
    else body.append('resume_text', resumeText.trim())
    setLoading(source)
    setError('')
    setResult(null)
    try {
      const { data } = await api.post('/resumes/analyze', body)
      setResult(data)
      setToast(`Resume analyzed successfully. ATS score: ${data.analysis.ats_score}/100.`)
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const scannedMessage = 'Could not read enough text from this scanned PDF. Please upload a clearer PDF or paste resume text manually.'
      setError(source === 'file' && file?.name.toLowerCase().endsWith('.pdf') && (message.includes('scanned') || message.includes('readable text')) ? scannedMessage : message)
      if (source === 'file') setTimeout(() => textRef.current?.focus(), 0)
    } finally {
      setLoading('')
    }
  }

  const analyzeText = () => {
    if (resumeText.trim().length < 300) {
      setError('Resume text must be at least 300 characters for a useful analysis.')
      textRef.current?.focus()
      return
    }
    submitAnalysis('text')
  }

  return <main className="shell max-w-5xl py-10">
    <Toast message={toast} type="success" onClose={() => setToast('')} />
    <p className="eyebrow">Resume lab</p>
    <h1 className="mt-2 text-4xl font-bold">See what recruiters—and ATS software—see.</h1>
    <p className="mt-3 max-w-2xl text-slate-400">Upload a PDF or resume image. Your file is processed securely on the backend and never embedded in the frontend.</p>
    {error && <div className="mt-6"><ErrorMessage text={error} /></div>}

    <section onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); pickFile(event.dataTransfer.files[0]) }} className="card mt-8 border-dashed text-center">
      <input ref={inputRef} className="hidden" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => pickFile(event.target.files[0])} />
      <UploadCloud className="mx-auto text-violet-400" size={40} />
      <h2 className="mt-4 text-xl font-bold">Upload PDF/JPG/PNG resume</h2>
      <p className="mt-2 text-sm text-slate-500">Drop a file here or browse · up to 5 MB</p>
      <button onClick={() => inputRef.current?.click()} className="btn-secondary mt-5">Choose resume file</button>
      {file && <div className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-xl bg-ink/70 p-3 text-left"><FileText className="text-cyan" /><div className="min-w-0"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p></div></div>}
      <button onClick={() => submitAnalysis('file')} disabled={!file || Boolean(loading)} className="btn-primary mt-5 w-full sm:w-auto">{loading === 'file' ? <><InlineSpinner /> Reading and analyzing...</> : <><Sparkles size={17} /> Analyze resume</>}</button>
    </section>

    <section className="card mt-6">
      <label className="label" htmlFor="resume-text">Or paste your resume text here</label>
      <textarea ref={textRef} id="resume-text" className="input min-h-64 resize-y leading-7" placeholder="Paste your professional summary, experience, education, skills, and projects..." value={resumeText} onChange={(event) => { setResumeText(event.target.value); setError('') }} />
      <div className="mt-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><p className={`text-xs ${resumeText.trim().length >= 300 ? 'text-emerald-400' : 'text-slate-500'}`}>{resumeText.trim().length}/300 minimum characters</p><button onClick={analyzeText} disabled={Boolean(loading)} className="btn-primary w-full sm:w-auto">{loading === 'text' ? <><InlineSpinner /> Analyzing text...</> : <><Sparkles size={17} /> Analyze pasted text</>}</button></div>
    </section>
    {result && <AnalysisResult result={result} />}
  </main>
}

function AnalysisResult({ result }) {
  const analysis = result.analysis
  return <section className="mt-7 space-y-5"><div className="card flex flex-col items-center justify-between gap-5 sm:flex-row"><div><p className="eyebrow">ATS readiness</p><h2 className="mt-2 text-2xl font-bold">{result.filename}</h2></div><div className="grid h-28 w-28 place-items-center rounded-full border-8 border-violet-500/30 text-center"><span><strong className="text-3xl">{analysis.ats_score}</strong><small className="block text-slate-500">out of 100</small></span></div></div><div className="grid gap-5 md:grid-cols-3"><ListCard title="Strengths" items={analysis.strengths} color="text-emerald-400" /><ListCard title="Weaknesses" items={analysis.weaknesses} color="text-amber-400" /><ListCard title="Missing skills" items={analysis.missing_skills} color="text-cyan" /></div><div className="card"><p className="eyebrow">Improved summary</p><p className="mt-4 leading-7 text-slate-300">{analysis.improved_summary}</p></div></section>
}

function ListCard({ title, items, color }) {
  return <div className="card"><h3 className={`font-bold ${color}`}>{title}</h3><ul className="mt-4 space-y-3 text-sm text-slate-400">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span>•</span><span>{item}</span></li>)}</ul></div>
}
