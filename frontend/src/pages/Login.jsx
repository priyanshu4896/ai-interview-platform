import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { InlineSpinner } from '../components/Loader'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try { await login(form); navigate(location.state?.from?.pathname || '/dashboard', { replace: true, state: { toast: 'Welcome back. Your practice dashboard is ready.' } }) }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  return <AuthLayout title="Welcome back" subtitle="Continue building your interview confidence.">
    <form className="space-y-5" onSubmit={submit}>
      {error && <ErrorMessage text={error} />}
      <div><label className="label">Email</label><input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div><label className="label">Password</label><input className="input" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
      <button className="btn-primary w-full" disabled={loading}>{loading && <InlineSpinner />}{loading ? 'Signing in...' : 'Sign in'}</button>
      <p className="text-center text-sm text-slate-400">New here? <Link className="text-violet-400 hover:text-violet-300" to="/register">Create an account</Link></p>
    </form>
  </AuthLayout>
}

export function AuthLayout({ title, subtitle, children }) {
  return <main className="shell grid min-h-[calc(100vh-4rem)] place-items-center py-12"><section className="card w-full max-w-md"><p className="eyebrow">InterviewAI</p><h1 className="mt-3 text-3xl font-bold">{title}</h1><p className="mb-8 mt-2 text-slate-400">{subtitle}</p>{children}</section></main>
}

export function ErrorMessage({ text }) { return <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{text}</div> }
