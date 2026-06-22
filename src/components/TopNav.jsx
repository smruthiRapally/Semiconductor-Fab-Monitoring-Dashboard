import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Factory, Cpu, TrendingUp, AlertTriangle,
  Wind, FileText, Bell, ChevronDown, Menu, X,
  Zap, User, Settings, LogOut, Radio, Package, DollarSign, ShoppingCart,
} from 'lucide-react'

const navItems = [
  { path: '/',            label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/production',  label: 'Production', icon: Factory },
  { path: '/machines',    label: 'Machines',   icon: Cpu },
  { path: '/yield',       label: 'Yield',      icon: TrendingUp },
  { path: '/defects',     label: 'Defects',    icon: AlertTriangle },
  { path: '/environment', label: 'Environment',icon: Wind },
  { path: '/materials',   label: 'Materials',  icon: Package },
  { path: '/revenue',     label: 'Revenue',    icon: DollarSign },
  { path: '/orders',      label: 'Orders',     icon: ShoppingCart },
  { path: '/reports',     label: 'Reports',    icon: FileText },
]

const alerts = [
  { id:1, msg:'Machine A12 — Temperature critical', type:'danger',  t:'2m ago' },
  { id:2, msg:'Machine B07 — Maintenance due',       type:'warning', t:'15m ago' },
  { id:3, msg:'Yield dipped 0.3% in last batch',     type:'warning', t:'1h ago' },
  { id:4, msg:'Clean room humidity nominal',         type:'success', t:'2h ago' },
]

function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const date = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
  const time = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })
  return (
    <div className="hidden md:flex flex-col items-end leading-tight">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest">{date}</span>
      <span className="text-xs font-mono font-bold text-cyan-400 text-glow-cyan">{time}</span>
    </div>
  )
}

export default function TopNav() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const unread = alerts.filter(a => a.type !== 'success').length

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const fn = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const alertDot = { danger:'bg-red-500', warning:'bg-amber-500', success:'bg-green-500' }
  const alertBorder = { danger:'border-red-500/30', warning:'border-amber-500/30', success:'border-green-500/30' }

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-blue-900/30">
        {/* shimmer line */}
        <div className="h-px w-full shimmer-line opacity-60" />

        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between h-14">
          {/* ── Logo ── */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center pulse-ring"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)' }}>
                <Zap size={16} className="text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black tracking-tight gradient-text-cyan leading-none">SemiFab</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">Control Center</p>
            </div>
          </div>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-wrap">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = path === '/' ? location.pathname === '/' : location.pathname === path
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200
                    ${active ? 'nav-pill-active' : 'nav-pill-inactive'}`}
                >
                  <Icon size={12} />
                  {label}
                </NavLink>
              )
            })}
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">
            <LiveClock />

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full"
              style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
              <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Live</span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(59,130,246,0.2)' }}
              >
                <Bell size={14} className="text-slate-400" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2"
                    style={{ ringColor:'#020817' }} />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl overflow-hidden anim-fade-up z-50"
                  style={{ background:'rgba(2,8,23,0.95)', border:'1px solid rgba(59,130,246,0.2)', backdropFilter:'blur(24px)' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom:'1px solid rgba(59,130,246,0.1)' }}>
                    <span className="text-xs font-bold text-slate-300">System Alerts</span>
                    <span className="fab-badge badge-red">{unread} NEW</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {alerts.map(a => (
                      <div key={a.id} className={`flex items-start gap-3 px-4 py-3 border-l-2 ${alertBorder[a.type]} transition-colors hover:bg-blue-950/30`}
                        style={{ borderBottom:'1px solid rgba(59,130,246,0.06)' }}>
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${alertDot[a.type]}`} />
                        <div>
                          <p className="text-xs text-slate-300">{a.msg}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">{a.t}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200"
                style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(59,130,246,0.2)' }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>
                  <span className="text-[9px] font-black text-white">FA</span>
                </div>
                <span className="text-xs font-semibold text-slate-300 hidden sm:block">Fab Admin</span>
                <ChevronDown size={11} className="text-slate-500 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden anim-fade-up z-50"
                  style={{ background:'rgba(2,8,23,0.95)', border:'1px solid rgba(59,130,246,0.2)', backdropFilter:'blur(24px)' }}>
                  <div className="px-4 py-3" style={{ borderBottom:'1px solid rgba(59,130,246,0.1)' }}>
                    <p className="text-xs font-bold text-slate-200">Fab Admin</p>
                    <p className="text-[10px] text-slate-500">admin@semifab.in</p>
                  </div>
                  {[{ icon:User, l:'My Profile' }, { icon:Settings, l:'Settings' }].map(({ icon:Icon, l }) => (
                    <button key={l} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-blue-950/40 transition-colors">
                      <Icon size={13} />{l}
                    </button>
                  ))}
                  <div style={{ borderTop:'1px solid rgba(59,130,246,0.1)' }}>
                    <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-red-400 hover:bg-red-950/30 transition-colors">
                      <LogOut size={13} />Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(59,130,246,0.2)' }}
            >
              {mobileOpen ? <X size={15} className="text-slate-400" /> : <Menu size={15} className="text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown nav */}
      {mobileOpen && (
        <div className="lg:hidden sticky top-14 z-40 anim-fade-up"
          style={{ background:'rgba(2,8,23,0.97)', border:'1px solid rgba(59,130,246,0.15)', backdropFilter:'blur(24px)' }}>
          <nav className="grid grid-cols-2 gap-1 p-3">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = path === '/' ? location.pathname === '/' : location.pathname === path
              return (
                <NavLink key={path} to={path}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200
                    ${active ? 'nav-pill-active' : 'nav-pill-inactive'}`}
                >
                  <Icon size={14} />{label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}
