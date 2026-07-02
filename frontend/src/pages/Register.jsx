import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { AuthLayout, ErrorMessage } from './Login'
import { InlineSpinner } from '../components/Loader'

export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    try { await register(form); navigate('/dashboard', { state: { toast: 'Account created. Your dashboard is ready.' } }) } catch (err) { setError(getErrorMessage(err)) } finally { setLoading(false) }
  }
  return <AuthLayout title="Create your account" subtitle="Your next great interview starts with one practice round.">
    <form className="space-y-5" onSubmit={submit}>
      {error && <ErrorMessage text={error} />}
      <div><label className="label">Full name</label><input className="input" name="name" required minLength="2" value={form.name} onChange={update} /></div>
      <div><label className="label">Email</label><input className="input" name="email" type="email" required value={form.email} onChange={update} /></div>
      <div><label className="label">Password</label><input className="input" name="password" type="password" required minLength="8" value={form.password} onChange={update} /><p className="mt-2 text-xs text-slate-500">Use at least 8 characters.</p></div>
      <button className="btn-primary w-full" disabled={loading}>{loading && <InlineSpinner />}{loading ? 'Creating account...' : 'Create account'}</button>
      <p className="text-center text-sm text-slate-400">Already registered? <Link className="text-violet-400" to="/login">Sign in</Link></p>
    </form>
  </AuthLayout>
}
