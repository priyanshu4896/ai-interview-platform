import { CalendarDays, Mail, Save, UserRound } from 'lucide-react'
import { useState } from 'react'
import { getErrorMessage } from '../api/axios'
import { InlineSpinner } from '../components/Loader'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: 'success' })

  const save = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await updateProfile(name)
      setNotification({ message: 'Profile updated successfully.', type: 'success' })
    } catch (error) {
      setNotification({ message: getErrorMessage(error), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return <main className="shell max-w-3xl py-10">
    <Toast message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, message: '' })} />
    <p className="eyebrow">Account</p><h1 className="mt-2 text-4xl font-bold">Profile</h1>
    <section className="card mt-8">
      <div className="flex items-center gap-4 border-b border-line pb-6"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-violet-400"><UserRound size={28} /></span><div><h2 className="text-xl font-bold">{user?.name}</h2><p className="text-sm text-slate-500">InterviewAI member</p></div></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><Info icon={Mail} label="Email" value={user?.email} /><Info icon={CalendarDays} label="Member since" value={new Date(user?.created_at).toLocaleDateString()} /></div>
      <form className="mt-8" onSubmit={save}><label className="label">Display name</label><div className="flex flex-col gap-3 sm:flex-row"><input className="input" value={name} minLength="2" maxLength="80" required onChange={(event) => setName(event.target.value)} /><button className="btn-primary shrink-0" disabled={loading || name.trim() === user?.name}>{loading ? <><InlineSpinner /> Saving...</> : <><Save size={17} /> Save changes</>}</button></div></form>
    </section>
  </main>
}

function Info({ icon: Icon, label, value }) {
  return <div className="rounded-xl bg-ink/60 p-4"><Icon className="text-slate-500" size={18} /><p className="mt-3 text-xs uppercase tracking-wider text-slate-600">{label}</p><p className="mt-1 truncate text-sm text-slate-300">{value}</p></div>
}
