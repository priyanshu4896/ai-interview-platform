import { BrainCircuit, History, LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const signOut = () => { logout(); navigate('/') }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-xl">
      <nav className="shell flex h-16 items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent"><BrainCircuit size={20} /></span>
          <span>Interview<span className="text-violet-400">AI</span></span>
        </Link>
        {user ? (
          <>
            <div className="hidden items-center gap-1 md:flex">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
                  <Icon size={16} />{label}
                </NavLink>
              ))}
              <button onClick={signOut} className="ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white"><LogOut size={16} /> Sign out</button>
            </div>
            <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
          </>
        ) : (
          <div className="flex gap-2"><Link className="btn-secondary !px-4 !py-2" to="/login">Log in</Link><Link className="btn-primary !px-4 !py-2" to="/register">Get started</Link></div>
        )}
      </nav>
      {user && open && (
        <div className="shell border-t border-line py-3 md:hidden">
          {links.map(({ to, label }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-slate-300">{label}</NavLink>)}
          <button onClick={signOut} className="w-full rounded-lg px-3 py-2 text-left text-slate-300">Sign out</button>
        </div>
      )}
    </header>
  )
}
