import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Factory, Cpu, TrendingUp, AlertTriangle,
  Wind, FileText, Bell, ChevronDown, Menu, X,
  Zap, User, Settings, LogOut, Radio, Package,
  DollarSign, ShoppingCart, ChevronRight,
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

const alertConfig = {
  danger:  { dot:'bg-red-500',   ring:'border-l-red-400',  bg:'bg-red-50'  },
  warning: { dot:'bg-amber-500', ring:'border-l-amber-400',bg:'bg-amber-50'},
  success: { dot:'bg-green-500', ring:'border-l-green-400',bg:''           },
}

function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const time = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })
  return (
    <div className="hidden lg:flex flex-col items-end leading-none">
      <span className="text-[9px] text-slate-400 uppercase tracking-wider">
        {now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
      </span>
      <span className="text-xs font-mono font-bold text-blue-600 mt-0.5">{time}</span>
    </div>
  )
}

export default function TopNav() {
  const location = useLocation()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef   = useRef(null)
  const profileRef = useRef(null)
  const unread = alerts.filter(a => a.type !== 'success').length

  useEffect(() => { setMobileOpen(false) }, [location.pathname])
  useEffect(() => {
    const fn = e => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <>
      {/* ── Main header ── */}
      <header className="nav-shell">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-900 leading-none tracking-tight"
                style={{ fontFamily:"'Space Grotesk', sans-serif" }}>SemiFab</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-0.5">Control Center</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map(({ path, label, icon:Icon }) => {
              const active = path === '/' ? location.pathname === '/' : location.pathname === path
              return (
                <NavLink key={path} to={path}
                  className={`nav-link ${active ? 'nav-link-active' : ''}`}>
                  <Icon size={12} />{label}
                </NavLink>
              )
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <LiveClock />

            {/* Live pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-dot"/>
              <span className="text-[9px] font-semibold text-green-700 uppercase tracking-wider">Live</span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                <Bell size={14} className="text-slate-500" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"/>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 card rounded-xl overflow-hidden z-50 anim-fade-up">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-800">System Alerts</span>
                    <span className="badge badge-red">{unread} New</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {alerts.map(a => {
                      const ac = alertConfig[a.type]
                      return (
                        <div key={a.id}
                          className={`flex items-start gap-3 px-4 py-3 border-l-2 ${ac.ring} border-b border-slate-50 hover:${ac.bg||'bg-slate-50'} transition-colors`}>
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${ac.dot}`}/>
                          <div>
                            <p className="text-xs text-slate-700">{a.msg}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{a.t}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                    <button className="text-[11px] text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                      View all alerts <ChevronRight size={10}/>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>
                  <span className="text-[9px] font-bold text-white">FA</span>
                </div>
                <span className="text-xs font-medium text-slate-700 hidden sm:block">Fab Admin</span>
                <ChevronDown size={11} className="text-slate-400 hidden sm:block"/>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 card rounded-xl overflow-hidden z-50 anim-fade-up">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-800">Fab Admin</p>
                    <p className="text-[10px] text-slate-500">admin@semifab.in</p>
                  </div>
                  {[{icon:User,l:'My Profile'},{icon:Settings,l:'Settings'}].map(({icon:Icon,l}) => (
                    <button key={l} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                      <Icon size={13}/>{l}
                    </button>
                  ))}
                  <div className="border-t border-slate-100">
                    <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={13}/>Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="xl:hidden w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white">
              {mobileOpen ? <X size={15} className="text-slate-600"/> : <Menu size={15} className="text-slate-600"/>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="xl:hidden sticky top-14 z-40 bg-white border-b border-slate-200 shadow-md anim-fade-in">
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-3 max-w-screen-2xl mx-auto">
            {navItems.map(({ path, label, icon:Icon }) => {
              const active = path === '/' ? location.pathname === '/' : location.pathname === path
              return (
                <NavLink key={path} to={path}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${active ? 'nav-link-active' : 'nav-link'}`}>
                  <Icon size={13}/>{label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}
