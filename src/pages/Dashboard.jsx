import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Layers, TrendingUp, Cpu, AlertTriangle, Zap,
  ArrowUpRight, ArrowDownRight, Package, CheckCircle,
  ChevronRight, Timer, FlaskConical, Microscope,
  CircuitBoard, AlertCircle, DollarSign, Factory,
  Activity, BarChart2, Shield, Play, ShoppingCart,
  Wind, FileText,
} from 'lucide-react'
import { productionTrend } from '../data/mockData'

/* ─── Semiconductor images (Unsplash, free) ─── */
const IMG = {
  hero:      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=85&fit=crop',
  cleanroom: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&q=80&fit=crop',
  wafer:     'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=900&q=80&fit=crop',
  circuit:   'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=900&q=80&fit=crop',
  lab:       'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=1200&q=80&fit=crop',
  chip:      'https://images.unsplash.com/photo-1601128533718-374ffcca299b?w=900&q=80&fit=crop',
  micro:     'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&q=80&fit=crop',
  pcb:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&fit=crop',
}

/* ─── Data ─── */
const kpiData = [
  { label:'Wafers Produced', value:'12,500', change:'+4.2%', pos:true,  icon:Layers,        accent:'#2563eb', bg:'#eff6ff' },
  { label:'Yield Rate',      value:'96.5%',  change:'+0.3%', pos:true,  icon:TrendingUp,    accent:'#0891b2', bg:'#ecfeff' },
  { label:'Active Machines', value:'42/48',  change:'+2',    pos:true,  icon:Cpu,           accent:'#7c3aed', bg:'#f5f3ff' },
  { label:'Defect Rate',     value:'0.8%',   change:'-0.1%', pos:true,  icon:AlertTriangle, accent:'#16a34a', bg:'#f0fdf4' },
]
const PIPELINE = [
  { id:'raw',   label:'Raw Wafer',   icon:FlaskConical, pct:100, color:'#16a34a' },
  { id:'litho', label:'Lithography', icon:Microscope,   pct:95,  color:'#2563eb' },
  { id:'etch',  label:'Etching',     icon:Zap,          pct:88,  color:'#0891b2' },
  { id:'test',  label:'Testing',     icon:CircuitBoard, pct:72,  color:'#7c3aed' },
  { id:'pack',  label:'Packaging',   icon:Package,      pct:58,  color:'#d97706' },
  { id:'done',  label:'Completed',   icon:CheckCircle,  pct:44,  color:'#16a34a' },
]
const ORDERS = [
  { id:'ORD-001', customer:'Samsung Semiconductor', logo:'SS', color:'#2563eb', product:'5nm FinFET Logic', progress:78, priority:'CRITICAL', status:'In Fab',      due:'30 Jun' },
  { id:'ORD-002', customer:'TSMC Alliance',         logo:'TA', color:'#0891b2', product:'14nm RF Chips',    progress:45, priority:'HIGH',     status:'Lithography', due:'08 Jul' },
  { id:'ORD-003', customer:'Intel Foundry',         logo:'IF', color:'#0ea5e9', product:'28nm Power IC',    progress:92, priority:'HIGH',     status:'Testing',     due:'24 Jun' },
  { id:'ORD-004', customer:'Qualcomm Fab',          logo:'QF', color:'#7c3aed', product:'7nm Mobile SoC',   progress:22, priority:'NORMAL',   status:'Raw Wafer',   due:'20 Jul' },
]
const ALERTS = [
  { type:'danger',  msg:'Machine A12 temperature critical — Bay 1', t:'2m ago',  icon:AlertCircle },
  { type:'warning', msg:'Machine B07 maintenance window approaching',t:'15m ago', icon:Timer },
  { type:'warning', msg:'Yield dipped 0.3% — Lot WL-447',            t:'1h ago',  icon:TrendingUp },
  { type:'success', msg:'Clean room particle count within ISO Class 5',t:'2h ago', icon:CheckCircle },
  { type:'success', msg:'Production target achieved — 12,500 wafers', t:'3h ago', icon:CheckCircle },
]
const prioBadge  = { CRITICAL:'badge badge-red', HIGH:'badge badge-amber', NORMAL:'badge badge-blue' }
const stageCols  = {
  'In Fab':      { color:'#0891b2', bg:'#ecfeff', border:'#a5f3fc' },
  'Lithography': { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
  'Testing':     { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  'Raw Wafer':   { color:'#64748b', bg:'#f8fafc', border:'#e2e8f0' },
}
const alertBar  = { danger:'border-l-red-500', warning:'border-l-amber-500', success:'border-l-green-500' }
const alertIcon = { danger:'text-red-500',     warning:'text-amber-600',     success:'text-green-600'    }

/* ─── Reusable pieces ─── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'8px 12px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize:'0.7rem', color:'#94a3b8', marginBottom:2 }}>{label}</p>
      <p style={{ fontSize:'0.82rem', fontWeight:700, color:'#2563eb' }}>{payload[0].value.toLocaleString()} wafers</p>
    </div>
  )
}

function KpiCard({ label, value, change, pos, icon:Icon, accent, bg, delay=0 }) {
  return (
    <div className="stat-card card-lift anim-fade-up" style={{ animationDelay:`${delay}ms` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="icon-box rounded-xl" style={{ background:bg, color:accent, width:44, height:44 }}>
          <Icon size={19}/>
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${pos?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}`}>
          {pos?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{change}
        </span>
      </div>
      <p style={{ fontSize:'1.6rem', fontWeight:800, color:'#0f172a', lineHeight:1, fontFamily:"'Space Grotesk',sans-serif" }}>{value}</p>
      <p style={{ fontSize:'0.75rem', color:'#64748b', marginTop:6, fontWeight:500 }}>{label}</p>
    </div>
  )
}

/* ─── Image card with hover ─── */
function ImgCard({ src, badge, title, to, height=180 }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to} style={{ display:'block', position:'relative', borderRadius:18, overflow:'hidden',
      height, textDecoration:'none', flexShrink:0,
      boxShadow: hov ? '0 14px 36px rgba(0,0,0,0.18)' : '0 4px 16px rgba(0,0,0,0.10)',
      transform: hov ? 'translateY(-5px)' : 'translateY(0)',
      transition:'all 0.25s ease' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ position:'absolute', inset:0, backgroundImage:`url('${src}')`,
        backgroundSize:'cover', backgroundPosition:'center',
        transform: hov ? 'scale(1.06)' : 'scale(1)', transition:'transform 0.5s ease' }}/>
      <div style={{ position:'absolute', inset:0,
        background:'linear-gradient(to top, rgba(5,10,35,0.90) 0%, rgba(5,10,35,0.40) 55%, rgba(5,10,35,0.15) 100%)' }}/>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 18px' }}>
        <p style={{ fontSize:'0.62rem', fontWeight:700, color:'#93c5fd',
          textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>{badge}</p>
        <p style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff',
          fontFamily:"'Space Grotesk',sans-serif" }}>{title}</p>
      </div>
      <div style={{ position:'absolute', top:12, right:12,
        background:'rgba(37,99,235,0.35)', border:'1px solid rgba(96,165,250,0.45)',
        borderRadius:6, padding:'2px 8px', fontSize:'0.6rem', color:'#bfdbfe', fontWeight:700,
        opacity: hov ? 1 : 0.7, transition:'opacity 0.2s' }}>LIVE →</div>
    </Link>
  )
}

/* ─── Wide banner with image bg ─── */
function Banner({ src, badge, title, accent, sub, links, minH=260 }) {
  return (
    <div style={{ position:'relative', overflow:'hidden', minHeight:minH, display:'flex', alignItems:'center' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:`url('${src}')`,
        backgroundSize:'cover', backgroundPosition:'center', zIndex:0 }}/>
      <div style={{ position:'absolute', inset:0, zIndex:1,
        background:'linear-gradient(90deg,rgba(5,10,30,0.94) 0%,rgba(5,10,30,0.72) 55%,rgba(5,10,30,0.20) 100%)' }}/>
      <div style={{ position:'relative', zIndex:2, padding:'40px 48px', maxWidth:680 }}>
        {badge && <p style={{ fontSize:'0.68rem', fontWeight:700, color:'#93c5fd',
          textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>{badge}</p>}
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",
          fontSize:'clamp(1.5rem,2.8vw,2.2rem)', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:10 }}>
          {title}{accent && <><br/><span style={{ color:'#60a5fa' }}>{accent}</span></>}
        </h2>
        {sub && <p style={{ fontSize:'0.88rem', color:'rgba(203,213,225,0.85)', lineHeight:1.7, marginBottom:20 }}>{sub}</p>}
        {links && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'10px 22px',
                borderRadius:9, background:l.primary?'#2563eb':'rgba(255,255,255,0.14)',
                color:'#fff', border:l.primary?'none':'1px solid rgba(255,255,255,0.35)',
                fontSize:'0.8rem', fontWeight:600, textDecoration:'none',
                backdropFilter:l.primary?'none':'blur(8px)', transition:'all 0.18s',
              }}>
                {l.label}<ChevronRight size={13}/>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   HERO — full-bleed background image, like reference
═══════════════════════════════════════════════════════ */
function Hero() {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div style={{ position:'relative', minHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      {/* bg image with slow zoom */}
      <div style={{ position:'absolute', inset:0, zIndex:0,
        backgroundImage:`url('${IMG.hero}')`,
        backgroundSize:'cover', backgroundPosition:'center 42%',
        transform: show ? 'scale(1.04)' : 'scale(1.10)',
        transition:'transform 9s ease-out' }}/>
      {/* dark gradient overlay */}
      <div style={{ position:'absolute', inset:0, zIndex:1,
        background:'linear-gradient(140deg,rgba(5,10,35,0.90) 0%,rgba(5,15,50,0.78) 50%,rgba(8,22,60,0.85) 100%)' }}/>
      {/* top color bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, zIndex:2,
        background:'linear-gradient(90deg,#2563eb,#0891b2,#7c3aed,#2563eb)' }}/>

      {/* ── MAIN CONTENT ── */}
      <div style={{ position:'relative', zIndex:3, flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}
        className="max-w-screen-2xl mx-auto w-full px-6 sm:px-12 lg:px-16 py-20 sm:py-28">

        {/* Live badge — like reference tag */}
        <div className={`transition-all duration-700 ${show?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}
          style={{ marginBottom:18 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px',
            borderRadius:99, background:'rgba(37,99,235,0.28)', border:'1px solid rgba(96,165,250,0.40)',
            fontSize:'0.68rem', fontWeight:700, color:'#bfdbfe', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80',
              boxShadow:'0 0 0 3px rgba(74,222,128,0.35)', animation:'pulseSoft 1.6s ease-in-out infinite', display:'inline-block' }}/>
            Semiconductor Fab Control Center · Live
          </span>
        </div>

        {/* MAIN HEADLINE — big bold like reference */}
        <h1 className={`transition-all duration-700 delay-100 ${show?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}
          style={{ fontFamily:"'Space Grotesk',sans-serif",
            fontSize:'clamp(2.4rem,5.5vw,4.2rem)', fontWeight:800,
            color:'#fff', lineHeight:1.08, marginBottom:16,
            textShadow:'0 2px 28px rgba(0,0,0,0.55)' }}>
          Precision Wafer<br/>
          Fabrication.<br/>
          <span style={{ color:'#60a5fa' }}>Real-Time Intelligence.</span>
        </h1>

        {/* subheading */}
        <p className={`transition-all duration-700 delay-150 ${show?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}
          style={{ fontSize:'1rem', color:'rgba(203,213,225,0.9)',
            maxWidth:560, marginBottom:36, lineHeight:1.75 }}>
          Monitor every wafer through 6 fabrication stages — yield, defects, machines,
          environment, materials, and customer orders from one unified control center.
        </p>

        {/* CTA buttons — exactly like reference */}
        <div className={`flex flex-wrap gap-4 mb-16 transition-all duration-700 delay-200 ${show?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}>
          <Link to="/production" style={{ display:'inline-flex', alignItems:'center', gap:8,
            padding:'14px 30px', background:'#2563eb', color:'#fff', borderRadius:10,
            fontSize:'0.9rem', fontWeight:700, textDecoration:'none',
            boxShadow:'0 4px 24px rgba(37,99,235,0.55)', transition:'all 0.18s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#1d4ed8'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#2563eb'; e.currentTarget.style.transform='translateY(0)' }}>
            <Play size={15}/>View Production Flow
          </Link>
          <Link to="/orders" style={{ display:'inline-flex', alignItems:'center', gap:8,
            padding:'14px 30px', background:'rgba(255,255,255,0.12)', color:'#fff',
            border:'1px solid rgba(255,255,255,0.35)', borderRadius:10,
            fontSize:'0.9rem', fontWeight:600, textDecoration:'none',
            backdropFilter:'blur(10px)', transition:'all 0.18s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.22)'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.transform='translateY(0)' }}>
            <ShoppingCart size={15}/>Customer Orders
          </Link>
        </div>

        {/* STAT COUNTERS — like reference "2000+ Active Members" */}
        <div className={`transition-all duration-700 delay-300 ${show?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
          <div style={{ height:1, background:'rgba(255,255,255,0.15)', marginBottom:28 }}/>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12">
            {[
              { v:'12,500+', l:'Wafers / Day'    },
              { v:'96.5%',   l:'Yield Rate'      },
              { v:'48',      l:'Active Machines' },
              { v:'₹5.6 Cr', l:'Monthly Revenue' },
            ].map(s => (
              <div key={s.l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'clamp(1.7rem,3vw,2.6rem)', fontWeight:800, color:'#fff',
                  fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:'0.7rem', color:'rgba(148,163,184,0.9)',
                  textTransform:'uppercase', letterSpacing:'0.1em', marginTop:6, fontWeight:500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURE CARDS STRIP (bottom of hero, dark bg) ── */}
      <div style={{ position:'relative', zIndex:3,
        background:'linear-gradient(to top,rgba(5,10,30,0.98) 0%,rgba(5,10,30,0.88) 100%)' }}>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon:Layers,   img:IMG.wafer,     title:'Wafer Production',   desc:'Track 12,500+ wafers daily across 6 fab stages with real-time counts and status.' },
              { icon:BarChart2,img:IMG.circuit,   title:'Yield & Defects',    desc:'AI-powered defect RCA with process stage breakdown, zone density, and escape rates.' },
              { icon:Shield,   img:IMG.cleanroom, title:'Clean Room ISO 5',   desc:'24/7 environment monitoring — temperature, humidity, particle count, AQI compliance.' },
              { icon:Activity, img:IMG.micro,     title:'Machine Telemetry',  desc:'Live thermal load, pressure gauges, maintenance tracking for all 48 fab machines.' },
            ].map((f,i) => {
              const Icon = f.icon
              return (
                <div key={f.title}
                  className={`transition-all duration-500 ${show?'opacity-100 translate-y-0':'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay:`${500+i*80}ms`,
                    background:'rgba(255,255,255,0.07)',
                    border:'1px solid rgba(255,255,255,0.13)',
                    borderRadius:14, padding:18, cursor:'default' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.13)'; e.currentTarget.style.transform='translateY(-3px)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='translateY(0)' }}>
                  <div style={{ height:72, borderRadius:10, overflow:'hidden', marginBottom:12,
                    backgroundImage:`url('${f.img}')`, backgroundSize:'cover', backgroundPosition:'center' }}/>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                    <div style={{ width:28, height:28, borderRadius:7,
                      background:'rgba(37,99,235,0.30)', border:'1px solid rgba(96,165,250,0.35)',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon size={13} style={{ color:'#93c5fd' }}/>
                    </div>
                    <h3 style={{ fontSize:'0.76rem', fontWeight:700, color:'#fff', lineHeight:1.2 }}>{f.title}</h3>
                  </div>
                  <p style={{ fontSize:'0.7rem', color:'rgba(148,163,184,0.85)', lineHeight:1.65 }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE — flowing colored sections
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div>
      {/* 1 ── HERO */}
      <Hero/>

      {/* 2 ── WHY SEMIFAB — light blue section with image, like reference "Why Choose" */}
      <div style={{ background:'linear-gradient(180deg,#f0f4ff 0%,#e8eeff 100%)' }}>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left image + badges */}
            <div style={{ position:'relative' }}>
              <div style={{ borderRadius:24, overflow:'hidden', height:400, boxShadow:'0 16px 48px rgba(37,99,235,0.15)' }}>
                <img src={IMG.cleanroom} alt="Clean room"
                  style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.9)' }}/>
              </div>
              {/* Stats badge — like reference "15+ YEARS" */}
              <div style={{ position:'absolute', bottom:24, left:24, background:'#2563eb',
                borderRadius:16, padding:'18px 22px', boxShadow:'0 8px 32px rgba(37,99,235,0.50)' }}>
                <div style={{ fontSize:'2.1rem', fontWeight:900, color:'#fff', lineHeight:1,
                  fontFamily:"'Space Grotesk',sans-serif" }}>12,500+</div>
                <div style={{ fontSize:'0.65rem', color:'#bfdbfe', textTransform:'uppercase',
                  letterSpacing:'0.12em', fontWeight:600, marginTop:4 }}>Wafers Per Day</div>
              </div>
              {/* Second badge */}
              <div style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.97)',
                borderRadius:14, padding:'12px 18px', boxShadow:'0 4px 20px rgba(0,0,0,0.14)' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#16a34a',
                  fontFamily:"'Space Grotesk',sans-serif" }}>96.5%</div>
                <div style={{ fontSize:'0.6rem', color:'#64748b', textTransform:'uppercase',
                  letterSpacing:'0.08em', fontWeight:600 }}>Yield Rate</div>
              </div>
            </div>
            {/* Right text — like reference "Why Choose CultFitNeo" */}
            <div>
              <p className="section-label mb-2" style={{ color:'#2563eb' }}>Why SemiFab?</p>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",
                fontSize:'clamp(1.9rem,3vw,2.7rem)', fontWeight:800, color:'#0f172a',
                lineHeight:1.12, marginBottom:14 }}>
                Why Choose<br/>
                <span style={{ color:'#2563eb' }}>SemiFab Control Center?</span>
              </h2>
              <p style={{ fontSize:'0.95rem', color:'#64748b', lineHeight:1.8, marginBottom:28, maxWidth:480 }}>
                SemiFab is an enterprise-grade semiconductor fabrication monitoring platform.
                We combine real-time telemetry, AI analytics, and order management to deliver
                complete visibility into every wafer — from silicon to shipment.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon:Layers,       title:'Live Wafer Tracking',  desc:'End-to-end visibility across all 6 stages with live wafer counts.',          color:'#2563eb', bg:'#eff6ff' },
                  { icon:BarChart2,    title:'Advanced Analytics',   desc:'Defect RCA, yield trends, and financial P&L — all in one dashboard.',        color:'#7c3aed', bg:'#f5f3ff' },
                  { icon:Shield,       title:'Compliance Ready',     desc:'ISO Class 5 clean room monitoring with automated alerts and audit logs.',    color:'#16a34a', bg:'#f0fdf4' },
                  { icon:ShoppingCart, title:'Order Management',     desc:'Track 8+ customer orders with financial, delivery and production timelines.', color:'#d97706', bg:'#fffbeb' },
                ].map(f => {
                  const Icon = f.icon
                  return (
                    <div key={f.title} className="feature-card p-4">
                      <div className="icon-box rounded-xl mb-3" style={{ background:f.bg, color:f.color, width:38, height:38 }}>
                        <Icon size={15}/>
                      </div>
                      <h3 style={{ fontSize:'0.82rem', fontWeight:700, color:'#0f172a', marginBottom:4 }}>{f.title}</h3>
                      <p style={{ fontSize:'0.72rem', color:'#64748b', lineHeight:1.65 }}>{f.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 ── WIDE BANNER — lab image */}
      <Banner src={IMG.lab}
        badge="From Silicon to Shipment"
        title="Every Step Monitored."
        accent="Zero Blind Spots."
        sub="Track yield rates, defect root causes, machine uptime, raw material inventory, and financial P&L — unified in one semiconductor fab intelligence platform."
        links={[
          { to:'/yield',   label:'Yield Analytics', primary:true  },
          { to:'/defects', label:'Defect Analysis',  primary:false },
        ]}/>

      {/* 4 ── KPI + 3 IMAGE CARDS — indigo background */}
      <div style={{ background:'linear-gradient(180deg,#eef2ff 0%,#e0e7ff 100%)' }}>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 py-14 space-y-8">
          <div>
            <p className="section-label mb-1" style={{ color:'#4f46e5' }}>Live Operations</p>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.8rem',
              fontWeight:800, color:'#1e1b4b' }}>Fabrication Dashboard</h2>
            <p style={{ fontSize:'0.87rem', color:'#6366f1', marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', display:'inline-block',
                animation:'pulseSoft 1.6s ease-in-out infinite' }}/>
              Real-time · Auto-refresh every 30s
            </p>
          </div>
          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((k,i) => <KpiCard key={k.label} {...k} delay={i*70}/>)}
          </div>
          {/* 3 image cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ImgCard src={IMG.cleanroom} badge="Environment · ISO Class 5" title="Clean Room Monitoring"  to="/environment" height={180}/>
            <ImgCard src={IMG.wafer}     badge="Production · 28nm–5nm"     title="Wafer Fabrication Line" to="/production"  height={180}/>
            <ImgCard src={IMG.circuit}   badge="Defect Analysis · RCA"     title="Quality Control Center" to="/defects"     height={180}/>
          </div>
        </div>
      </div>

      {/* 5 ── PRODUCTION TREND + STAGE STATUS — white */}
      <div style={{ background:'#fff' }}>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 py-14">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Chart */}
            <div className="xl:col-span-3 card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'#0f172a' }}>Weekly Production Trend</h3>
                  <p style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:2 }}>Wafers produced Mon – Fri</p>
                </div>
                <span className="badge badge-indigo">This Week</span>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={productionTrend} margin={{ top:5, right:5, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={v=>`${(v/1000).toFixed(0)}k`} domain={[9000,13500]}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Area type="monotone" dataKey="wafers" stroke="#4f46e5" strokeWidth={2.5} fill="url(#blueGrad)"
                    dot={{ fill:'#4f46e5', r:4, strokeWidth:2, stroke:'#c7d2fe' }} activeDot={{ r:6, fill:'#4338ca' }}/>
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                {[{l:'Peak Day',v:'Friday',s:'12,500'},{l:'Weekly Total',v:'56,000',s:'wafers'},{l:'WoW Growth',v:'+25%',s:'vs prior week'}].map(s => (
                  <div key={s.l} style={{ textAlign:'center' }}>
                    <p style={{ fontSize:'0.65rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.l}</p>
                    <p style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a', marginTop:2 }}>{s.v}</p>
                    <p style={{ fontSize:'0.65rem', color:'#94a3b8' }}>{s.s}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Stage status */}
            <div className="xl:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'#0f172a' }}>Process Stage Status</h3>
                  <p style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:2 }}>Live across all stages</p>
                </div>
                <span className="badge badge-green">
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulseSoft 1.6s ease-in-out infinite' }}/>
                  Live
                </span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {PIPELINE.map((s,i) => {
                  const Icon = s.icon
                  return (
                    <div key={s.id}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <Icon size={12} style={{ color:s.color }}/>
                          <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#334155' }}>{s.label}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:'0.78rem', fontWeight:700, color:s.color }}>{s.pct}%</span>
                          <span className={`badge text-[9px] ${s.pct>=90?'badge-green':s.pct>=75?'badge-amber':'badge-slate'}`}>
                            {s.pct>=90?'On Track':s.pct>=75?'Caution':'Behind'}
                          </span>
                        </div>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width:animated?`${s.pct}%`:'0%', background:s.color, transitionDelay:`${i*100}ms` }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100">
                {[{l:'Throughput',v:'2,500/d',c:'#0891b2'},{l:'Cycle Time',v:'18.5h',c:'#7c3aed'},{l:'On-Time',v:'97.3%',c:'#16a34a'}].map(s => (
                  <div key={s.l} style={{ textAlign:'center', padding:'8px 4px', borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                    <p style={{ fontSize:'0.6rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.l}</p>
                    <p style={{ fontSize:'0.8rem', fontWeight:700, marginTop:2, color:s.c }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 ── SECOND BANNER — circuit image */}
      <Banner src={IMG.pcb}
        badge="Advanced Semiconductor Analytics"
        title="Data-Driven Fabrication."
        accent="Engineered for Excellence."
        sub="From wafer starts to customer delivery — every metric tracked, every anomaly flagged, every decision informed by real-time data."
        links={[
          { to:'/revenue', label:'Revenue Analytics', primary:true  },
          { to:'/orders',  label:'Customer Orders',   primary:false },
        ]}/>

      {/* 7 ── ORDERS + ALERTS — teal/green tinted bg */}
      <div style={{ background:'linear-gradient(180deg,#f0fdf4 0%,#dcfce7 100%)' }}>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 py-14">
          <div className="mb-6">
            <p className="section-label mb-1" style={{ color:'#16a34a' }}>Order Intelligence</p>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.7rem', fontWeight:800, color:'#14532d' }}>
              Customer Orders & Alerts
            </h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Orders table */}
            <div className="xl:col-span-2 card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Active Customer Orders</h3>
                  <p style={{ fontSize:'0.73rem', color:'#94a3b8', marginTop:2 }}>Click any order for full details</p>
                </div>
                <Link to="/orders" className="btn-ghost text-[11px] py-1.5 px-3 flex items-center gap-1">
                  View All <ChevronRight size={12}/>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Customer</th><th>Product</th><th>Progress</th><th>Stage</th><th>Priority</th><th>Due</th></tr>
                  </thead>
                  <tbody>
                    {ORDERS.map(o => {
                      const sc = stageCols[o.status]||{color:'#64748b',bg:'#f8fafc',border:'#e2e8f0'}
                      return (
                        <tr key={o.id} className="cursor-pointer">
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:32, height:32, borderRadius:10, flexShrink:0,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize:'0.68rem', fontWeight:700, color:o.color,
                                background:`${o.color}15`, border:`1px solid ${o.color}25` }}>{o.logo}</div>
                              <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#0f172a' }}>{o.customer}</span>
                            </div>
                          </td>
                          <td style={{ fontSize:'0.75rem', color:'#64748b' }}>{o.product}</td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:80 }}>
                              <div className="progress-track" style={{ flex:1, height:5 }}>
                                <div className="progress-fill" style={{ width:`${o.progress}%`, background:o.color }}/>
                              </div>
                              <span style={{ fontSize:'0.68rem', fontWeight:700, color:'#334155', width:26 }}>{o.progress}%</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge" style={{ background:sc.bg, color:sc.color, borderColor:sc.border, fontSize:'0.62rem' }}>
                              {o.status}
                            </span>
                          </td>
                          <td><span className={prioBadge[o.priority]} style={{ fontSize:'0.62rem' }}>{o.priority}</span></td>
                          <td style={{ fontSize:'0.75rem', color:'#64748b' }}>{o.due}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding:'10px 20px', background:'#f8fafc', borderTop:'1px solid #f1f5f9',
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.68rem', color:'#94a3b8' }}>Showing 4 of 8 orders</span>
                <Link to="/orders" style={{ fontSize:'0.73rem', color:'#2563eb', fontWeight:600,
                  display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>
                  All orders <ChevronRight size={11}/>
                </Link>
              </div>
            </div>
            {/* Alerts */}
            <div className="card overflow-hidden">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid #f1f5f9' }}>
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>System Alerts</h3>
                <span className="badge badge-red">3 Active</span>
              </div>
              {ALERTS.map((a,i) => {
                const Icon = a.icon
                return (
                  <div key={i} className={`flex items-start gap-3 border-l-[3px] ${alertBar[a.type]}`}
                    style={{ padding:'12px 16px', borderBottom:'1px solid #f8fafc',
                      background: i%2===0 ? '#fff' : '#fafafa', transition:'background 0.12s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='#eff6ff' }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=i%2===0?'#fff':'#fafafa' }}>
                    <Icon size={14} className={`flex-shrink-0 mt-0.5 ${alertIcon[a.type]}`}/>
                    <div>
                      <p style={{ fontSize:'0.75rem', color:'#334155', lineHeight:1.5 }}>{a.msg}</p>
                      <p style={{ fontSize:'0.65rem', color:'#94a3b8', marginTop:2 }}>{a.t}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 8 ── CHIP IMAGE + QUICK ACCESS — amber tinted */}
      <div style={{ background:'linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%)' }}>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chip image card */}
            <Link to="/materials" style={{ display:'block', position:'relative', borderRadius:20,
              overflow:'hidden', minHeight:220, textDecoration:'none',
              boxShadow:'0 8px 32px rgba(217,119,6,0.18)', transition:'transform 0.22s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-5px)' }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:`url('${IMG.chip}')`,
                backgroundSize:'cover', backgroundPosition:'center' }}/>
              <div style={{ position:'absolute', inset:0,
                background:'linear-gradient(to top,rgba(5,10,30,0.92) 0%,rgba(5,10,30,0.55) 50%,rgba(5,10,30,0.18) 100%)' }}/>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'22px 26px' }}>
                <p style={{ fontSize:'0.62rem', fontWeight:700, color:'#fcd34d', textTransform:'uppercase',
                  letterSpacing:'0.12em', marginBottom:5 }}>Materials & Cost</p>
                <p style={{ fontSize:'1rem', fontWeight:700, color:'#fff',
                  fontFamily:"'Space Grotesk',sans-serif", marginBottom:12 }}>Raw Material Inventory</p>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
                  background:'#d97706', color:'#fff', borderRadius:8, fontSize:'0.75rem', fontWeight:600 }}>
                  View Materials <ChevronRight size={12}/>
                </span>
              </div>
            </Link>
            {/* Quick access grid */}
            <div className="lg:col-span-2">
              <h3 style={{ fontSize:'1rem', fontWeight:700, color:'#92400e', marginBottom:14 }}>Quick Access</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { to:'/production',  label:'Production',  icon:Factory,       color:'#2563eb', bg:'#eff6ff' },
                  { to:'/machines',    label:'Machines',    icon:Cpu,           color:'#7c3aed', bg:'#f5f3ff' },
                  { to:'/yield',       label:'Yield',       icon:TrendingUp,    color:'#0891b2', bg:'#ecfeff' },
                  { to:'/defects',     label:'Defects',     icon:AlertTriangle, color:'#d97706', bg:'#fffbeb' },
                  { to:'/revenue',     label:'Revenue',     icon:DollarSign,    color:'#16a34a', bg:'#f0fdf4' },
                  { to:'/reports',     label:'Reports',     icon:BarChart2,     color:'#dc2626', bg:'#fef2f2' },
                ].map(({ to, label, icon:Icon, color, bg }) => (
                  <Link key={to} to={to} className="feature-card group"
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                      textAlign:'center', padding:'20px 12px', gap:8, textDecoration:'none' }}>
                    <div className="icon-box rounded-xl group-hover:scale-110 transition-transform"
                      style={{ background:bg, color, width:44, height:44 }}>
                      <Icon size={19}/>
                    </div>
                    <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#334155' }}
                      className="group-hover:text-blue-600 transition-colors">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9 ── FINAL BANNER — micro image */}
      <Banner src={IMG.micro} minH={240}
        badge="Enterprise Semiconductor Intelligence"
        title="Precision. Performance."
        accent="Powered by Real-Time Data."
        sub="SemiFab monitors every dimension of your fab — from ISO clean room compliance to customer delivery timelines — so you never miss a metric that matters."
        links={[
          { to:'/environment', label:'Environment', primary:true  },
          { to:'/reports',     label:'Reports',     primary:false },
        ]}/>

      {/* bottom spacing */}
      <div style={{ height:48, background:'#f0f4ff' }}/>
    </div>
  )
}
