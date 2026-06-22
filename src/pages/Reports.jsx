import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  FileText, Download, Factory, TrendingUp, TrendingDown, AlertTriangle,
  Cpu, Wind, Calendar, Clock, Loader2, CheckCircle,
  IndianRupee, BarChart2, Layers, Radio, Zap,
  Package, ShoppingCart, Users, Star,
} from 'lucide-react'
import { reportData } from '../data/mockData'

const now = new Date()
const dateStr = now.toLocaleDateString('en-IN',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })
const timeStr = now.toLocaleTimeString('en-IN',{ hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })

function formatINR(val) {
  if (val >= 10000000) return `₹${(val/10000000).toFixed(2)}Cr`
  if (val >= 100000)   return `₹${(val/100000).toFixed(1)}L`
  return `₹${val.toLocaleString('en-IN')}`
}

/* ── Financial data ── */
const financialData = [
  { month:'Jan', revenue:42000000, cost:28500000 },
  { month:'Feb', revenue:45000000, cost:29800000 },
  { month:'Mar', revenue:48000000, cost:31200000 },
  { month:'Apr', revenue:51000000, cost:32500000 },
  { month:'May', revenue:54000000, cost:33600000 },
  { month:'Jun', revenue:56000000, cost:34800000 },
]

const finPie = [
  { name:'Materials', value:38, color:'#2563eb' },
  { name:'Labour',    value:22, color:'#06b6d4' },
  { name:'Energy',    value:18, color:'#8b5cf6' },
  { name:'Maintenance',value:12, color:'#f59e0b'},
  { name:'Overhead',  value:10, color:'#10b981' },
]

/* ── Executive Summary data ── */
const execSummary = {
  headline:'Record revenue of ₹5.6 Cr in June 2024, driven by CRITICAL orders for Samsung (5nm FinFET) and Intel (28nm Power IC).',
  highlights:[
    { icon:'🟢', text:'Yield rate at 96.5% — above 96% target for 3rd consecutive month' },
    { icon:'🟢', text:'12,500 wafers produced — 96.2% of monthly target achieved' },
    { icon:'🟡', text:'Defects increased by 12 units — Particle contamination remains dominant (45%)' },
    { icon:'🟡', text:'Photoresist (EUV Grade) at 28% stock — reorder initiated with JSR Corporation' },
    { icon:'🔴', text:'HF Etching Solution critically low (12%) — emergency reorder in progress' },
    { icon:'🟢', text:'Machine uptime at 96.8% — 42 of 48 machines operational' },
  ],
  kpis:[
    { l:'Revenue',   v:'₹5.6 Cr',  trend:'+3.7%', pos:true },
    { l:'Profit',    v:'₹2.12 Cr', trend:'+3.9%', pos:true },
    { l:'Margin',    v:'37.9%',    trend:'+0.1%', pos:true },
    { l:'Yield',     v:'96.5%',    trend:'+0.3%', pos:true },
    { l:'Defects',   v:'356',      trend:'+12',   pos:false },
    { l:'Uptime',    v:'96.8%',    trend:'+0.2%', pos:true },
  ],
}

const FabTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-bold" style={{ color:p.color||'#60a5fa' }}>
          {p.name}: {p.name.includes('Revenue')||p.name.includes('Cost') ? formatINR(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

function SectionCard({ icon:Icon, accent, title, rows, delay=0 }) {
  return (
    <div className="glass rounded-2xl overflow-hidden anim-fade-up" style={{ animationDelay:`${delay}ms`, border:`1px solid ${accent}20` }}>
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom:'1px solid rgba(59,130,246,0.1)', background:`${accent}10` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:accent }}>
          <Icon size={13} className="text-white"/>
        </div>
        <h3 className="text-xs font-bold text-slate-200">{title}</h3>
      </div>
      {rows.map(([k,v]) => (
        <div key={k} className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-950/20 transition-colors"
          style={{ borderBottom:'1px solid rgba(59,130,246,0.05)' }}>
          <span className="text-[10px] text-slate-500">{k}</span>
          <span className="text-[11px] font-bold text-slate-200">{v}</span>
        </div>
      ))}
    </div>
  )
}

/* ── PDF generator ── */
async function generatePDF(type) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = 0

  const titles = {
    full: 'FAB PERFORMANCE REPORT',
    production: 'PRODUCTION REPORT',
    financial: 'FINANCIAL REPORT',
    defect: 'DEFECT ANALYSIS REPORT',
    order: 'ORDER SUMMARY REPORT',
    executive: 'EXECUTIVE SUMMARY',
  }

  doc.setFillColor(2, 8, 23); doc.rect(0,0,W,297,'F')
  doc.setFillColor(37,99,235); doc.rect(0,0,W,45,'F')
  doc.setFillColor(30,64,175); doc.rect(0,38,W,7,'F')
  doc.setTextColor(255,255,255)
  doc.setFontSize(20); doc.setFont('helvetica','bold')
  doc.text(titles[type]||titles.full, W/2, 16, { align:'center' })
  doc.setFontSize(9); doc.setFont('helvetica','normal')
  doc.text('Semiconductor Fabrication Monitoring System — SemiFab Control Center', W/2, 25, { align:'center' })
  doc.setFontSize(8)
  doc.text(`Generated: ${dateStr}  |  ${timeStr}`, W/2, 35, { align:'center' })
  y = 55

  const sec = (title) => {
    if (y > 248) { doc.addPage(); doc.setFillColor(2,8,23); doc.rect(0,0,W,297,'F'); y=15 }
    doc.setFillColor(15,23,42); doc.setDrawColor(37,99,235)
    doc.roundedRect(12,y,W-24,9,2,2,'FD')
    doc.setTextColor(96,165,250); doc.setFontSize(10); doc.setFont('helvetica','bold')
    doc.text(title, 18, y+6.2)
    y += 14
  }
  const kv = (k,v) => {
    if (y>272) { doc.addPage(); doc.setFillColor(2,8,23); doc.rect(0,0,W,297,'F'); y=15 }
    doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184)
    doc.text(k,20,y)
    doc.setFont('helvetica','bold'); doc.setTextColor(226,232,240)
    doc.text(String(v),105,y)
    y+=7
  }

  if (type==='executive'||type==='full') {
    sec('EXECUTIVE SUMMARY')
    doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184)
    const lines = doc.splitTextToSize(execSummary.headline, W-40)
    doc.text(lines,20,y); y+=lines.length*6+4
    execSummary.highlights.forEach(h => { kv('→', h.text) })
    y+=4
  }
  if (type==='production'||type==='full') {
    sec('1. PRODUCTION SUMMARY')
    kv('Wafers Produced',`${reportData.production.wafersProduced.toLocaleString('en-IN')} units`)
    kv('Production Target',`${reportData.production.wafersTarget.toLocaleString('en-IN')} units`)
    kv('Target Achievement',`${reportData.production.efficiency}%`)
    kv('Cycle Time',`${reportData.production.cycleTime} hours`)
    kv('Daily Throughput',`${reportData.production.throughput.toLocaleString('en-IN')} wafers/day`)
    kv('Wafers On Hold',`${reportData.production.onHold} units`)
    y+=4
  }
  if (type==='financial'||type==='full') {
    sec('2. FINANCIAL REPORT')
    kv('Revenue (Jun)','₹5.60 Cr'); kv('Mfg Cost (Jun)','₹3.48 Cr')
    kv('Profit (Jun)','₹2.12 Cr'); kv('Profit Margin','37.9%')
    kv('Revenue YTD','₹29.6 Cr'); kv('Cost/Wafer (Est)','₹2,784')
    y+=4
  }
  if (type==='defect'||type==='full') {
    sec('3. DEFECT ANALYSIS REPORT')
    kv('Total Defects',`${reportData.defects.totalDefects}`)
    kv('Defect Density',`${reportData.defects.defectDensity} /cm²`)
    kv('Critical Defects',`${reportData.defects.criticalDefects}`)
    kv('Inspection Coverage',`${reportData.defects.inspectionCoverage}%`)
    kv('Dominant Type','Particle Defects (45%)')
    kv('Defect Cost (Est)','₹6.54 Lakh/month')
    y+=4
    autoTable(doc,{
      startY:y,
      head:[['Defect Type','Count','Severity','Location','Est. Cost']],
      body:[
        ['Particle Defects','128','High','Lithography','₹3.84 Lakh'],
        ['Pattern Defects','98','Medium','Etching','₹2.94 Lakh'],
        ['Alignment Defects','56','Low','Deposition','₹1.68 Lakh'],
        ['Contamination','34','High','Clean Room','₹1.02 Lakh'],
        ['Gate Oxide','22','Medium','Oxidation','₹66,000'],
        ['Metal Shorts','18','High','Metallization','₹54,000'],
      ],
      headStyles:{ fillColor:[37,99,235], textColor:255, fontStyle:'bold', fontSize:8 },
      bodyStyles:{ fontSize:7.5, textColor:[203,213,225], fillColor:[2,8,23] },
      alternateRowStyles:{ fillColor:[15,23,42] },
      margin:{left:12,right:12},
    })
    y = doc.lastAutoTable.finalY + 8
  }
  if (type==='order'||type==='full') {
    sec('4. ORDER SUMMARY REPORT')
    autoTable(doc,{
      startY:y,
      head:[['Order ID','Customer','Product','Progress','Status','Delivery']],
      body:[
        ['ORD-001','Samsung Semiconductor','5nm FinFET Logic','78%','In Fab','30 Jun 2024'],
        ['ORD-002','TSMC Alliance','14nm RF Chips','45%','Lithography','08 Jul 2024'],
        ['ORD-003','Intel Foundry','28nm Power IC','92%','Testing','24 Jun 2024'],
        ['ORD-004','Qualcomm Fab','7nm Mobile SoC','22%','Raw Wafer','20 Jul 2024'],
        ['ORD-005','NXP Technologies','180nm Automotive','99%','Packaging','22 Jun 2024'],
        ['ORD-006','Infineon Systems','65nm Mixed Signal','0%','Queued','01 Aug 2024'],
      ],
      headStyles:{ fillColor:[37,99,235], textColor:255, fontStyle:'bold', fontSize:8 },
      bodyStyles:{ fontSize:7.5, textColor:[203,213,225], fillColor:[2,8,23] },
      alternateRowStyles:{ fillColor:[15,23,42] },
      margin:{left:12,right:12},
    })
    y = doc.lastAutoTable.finalY + 8
  }
  if (type==='full') {
    sec('5. MACHINE & ENVIRONMENT STATUS')
    kv('Running Machines',`${reportData.machines.running} / ${reportData.machines.totalMachines}`)
    kv('Avg Uptime',`${reportData.machines.avgUptime}%`)
    kv('Temperature',reportData.environment.temperature)
    kv('Humidity',reportData.environment.humidity)
    kv('Clean Room',reportData.environment.cleanRoomClass)
    kv('Air Quality',reportData.environment.airQuality)
  }

  const pages = doc.internal.getNumberOfPages()
  for (let i=1;i<=pages;i++) {
    doc.setPage(i)
    doc.setFontSize(7.5); doc.setTextColor(71,85,105); doc.setFont('helvetica','normal')
    doc.text('SemiFab Monitoring System — Confidential | Internal Use Only',12,291)
    doc.text(`Page ${i} of ${pages}`,W-12,291,{align:'right'})
    doc.setDrawColor(37,99,235,0.3); doc.line(12,287,W-12,287)
  }
  doc.save(`semifab-${type}-report-${now.toISOString().slice(0,10)}.pdf`)
}

/* ── CSV generator ── */
function generateCSV() {
  const rows = [
    ['FAB PERFORMANCE REPORT — SemiFab Control Center'],
    [`Generated: ${dateStr} ${timeStr}`],[''],
    ['EXECUTIVE SUMMARY'],['Headline',execSummary.headline],[''],
    ['PRODUCTION SUMMARY'],
    ['Wafers Produced',reportData.production.wafersProduced],
    ['Target',reportData.production.wafersTarget],
    ['Achievement(%)',reportData.production.efficiency],
    ['Cycle Time(hrs)',reportData.production.cycleTime],
    ['Throughput/day',reportData.production.throughput],
    ['On Hold',reportData.production.onHold],[''],
    ['FINANCIAL REPORT'],
    ['Revenue Jun','₹5.60 Cr'],['Mfg Cost Jun','₹3.48 Cr'],
    ['Profit Jun','₹2.12 Cr'],['Margin','37.9%'],['Revenue YTD','₹29.6 Cr'],[''],
    ['DEFECT REPORT'],
    ['Total Defects',reportData.defects.totalDefects],
    ['Density(/cm2)',reportData.defects.defectDensity],
    ['Critical',reportData.defects.criticalDefects],
    ['Coverage(%)',reportData.defects.inspectionCoverage],[''],
    ['ORDER SUMMARY'],
    ['Order ID','Customer','Product','Progress','Status'],
    ['ORD-001','Samsung Semiconductor','5nm FinFET Logic','78%','In Fab'],
    ['ORD-002','TSMC Alliance','14nm RF Chips','45%','Lithography'],
    ['ORD-003','Intel Foundry','28nm Power IC','92%','Testing'],
    ['ORD-004','Qualcomm Fab','7nm Mobile SoC','22%','Raw Wafer'],
    ['ORD-005','NXP Technologies','180nm Automotive','99%','Packaging'],
    ['ORD-006','Infineon Systems','65nm Mixed Signal','0%','Queued'],[''],
    ['MACHINE STATUS'],
    ['Total',reportData.machines.totalMachines],['Running',reportData.machines.running],
    ['Idle',reportData.machines.idle],['Maintenance',reportData.machines.maintenance],
    ['Avg Uptime(%)',reportData.machines.avgUptime],
  ]
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url
  a.download = `semifab-full-report-${now.toISOString().slice(0,10)}.csv`
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

const REPORT_TYPES = [
  { key:'full',       label:'Full Report',       icon:FileText,     accent:'#2563eb', desc:'All 5 sections combined' },
  { key:'production', label:'Production Report',  icon:Factory,      accent:'#06b6d4', desc:'Wafer output & throughput' },
  { key:'financial',  label:'Financial Report',   icon:IndianRupee,  accent:'#10b981', desc:'Revenue, cost & profit P&L' },
  { key:'defect',     label:'Defect Report',      icon:AlertTriangle,accent:'#f59e0b', desc:'Defect types & root causes' },
  { key:'order',      label:'Order Report',       icon:ShoppingCart, accent:'#8b5cf6', desc:'Customer orders & status' },
  { key:'executive',  label:'Executive Summary',  icon:Star,         accent:'#fbbf24', desc:'KPIs & strategic highlights' },
]

export default function Reports() {
  const [states, setStates] = useState({})
  const [csvState, setCsvState] = useState('idle')
  const [activeTab, setActiveTab] = useState('overview')

  const handlePDF = async (key) => {
    setStates(s => ({...s, [key]:'loading'}))
    try { await generatePDF(key); setStates(s=>({...s,[key]:'done'})) }
    catch(e) { console.error(e); setStates(s=>({...s,[key]:'idle'})) }
    finally { setTimeout(() => setStates(s=>({...s,[key]:'idle'})), 3000) }
  }

  const handleCSV = () => {
    setCsvState('loading')
    setTimeout(() => { generateCSV(); setCsvState('done'); setTimeout(()=>setCsvState('idle'),3000) }, 600)
  }

  const tabs = [
    { key:'overview',   label:'Overview' },
    { key:'production', label:'Production' },
    { key:'financial',  label:'Financial' },
    { key:'defects',    label:'Defects' },
    { key:'orders',     label:'Orders' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Reports</span> &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot"/>
            Generate, export &amp; analyze — Production · Financial · Defect · Order reports
          </p>
        </div>
        <div className="flex gap-2">
          <span className="fab-badge badge-cyan"><Calendar size={9}/>{now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
          <span className="fab-badge badge-green"><CheckCircle size={9}/>6 REPORTS READY</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up"
        style={{ border:'1px solid rgba(251,191,36,0.2)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#fbbf24,#f59e0b,transparent)' }}/>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'rgba(251,191,36,0.2)', border:'1px solid rgba(251,191,36,0.4)' }}>
              <Star size={15} className="text-amber-300"/>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Executive Summary</h2>
              <p className="text-[10px] text-slate-500">Jun 2024 · Key highlights &amp; strategic KPIs</p>
            </div>
          </div>
          <button onClick={() => handlePDF('executive')}
            className="btn-fab-secondary text-[10px] py-1.5 px-3 min-w-[130px] justify-center"
            disabled={states['executive']==='loading'}>
            {states['executive']==='loading' ? <Loader2 size={11} className="animate-spin"/> :
             states['executive']==='done'    ? <CheckCircle size={11} className="text-green-300"/> :
             <Download size={11}/>}
            {states['executive']==='loading'?'Generating…':states['executive']==='done'?'Downloaded!':'Export PDF'}
          </button>
        </div>
        <p className="text-[11px] text-slate-300 mb-4 leading-relaxed">{execSummary.headline}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {execSummary.kpis.map(k => (
            <div key={k.l} className="rounded-xl p-3 text-center"
              style={{ background:'rgba(15,23,42,0.6)', border:`1px solid ${k.pos?'rgba(74,222,128,0.15)':'rgba(248,113,113,0.15)'}` }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">{k.l}</p>
              <p className="text-sm font-black text-white mt-0.5">{k.v}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {k.pos ? <TrendingUp size={9} className="text-green-400"/> : <TrendingDown size={9} className="text-red-400"/>}
                <span className={`text-[9px] font-bold ${k.pos?'text-green-400':'text-red-400'}`}>{k.trend}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {execSummary.highlights.map((h,i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sm flex-shrink-0">{h.icon}</span>
              <p className="text-[10px] text-slate-400">{h.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Type Cards — Download options */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileText size={14} className="text-blue-400"/>Download Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map((rt, i) => {
            const Icon = rt.icon
            const st = states[rt.key]
            return (
              <div key={rt.key} className="glass rounded-2xl p-4 relative overflow-hidden anim-fade-up"
                style={{ animationDelay:`${i*60}ms`, border:`1px solid ${rt.accent}20` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg,transparent,${rt.accent},transparent)` }}/>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background:`${rt.accent}20`, border:`1px solid ${rt.accent}40` }}>
                      <Icon size={14} style={{ color:rt.accent }}/>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">{rt.label}</p>
                      <p className="text-[9px] text-slate-500">{rt.desc}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => handlePDF(rt.key)}
                  disabled={st==='loading'}
                  className="w-full btn-fab-primary text-[10px] py-1.5 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background:`linear-gradient(135deg,${rt.accent}dd,${rt.accent}99)` }}>
                  {st==='loading' ? <Loader2 size={11} className="animate-spin"/> :
                   st==='done'    ? <CheckCircle size={11} className="text-green-300"/> :
                   <Download size={11}/>}
                  {st==='loading'?'Generating…':st==='done'?'Downloaded!':'Export PDF'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* CSV full export */}
      <div className="glass rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 shimmer-line opacity-50"/>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={15} className="text-blue-400"/>Full Data Export (CSV)
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">All sections · Production · Financial · Defects · Orders · Machines · Environment</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-[10px] text-slate-500"><Calendar size={10}/>{dateStr}</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock size={10}/>{timeStr}</span>
            </div>
          </div>
          <button onClick={handleCSV} disabled={csvState==='loading'}
            className="btn-fab-secondary min-w-[160px] justify-center disabled:opacity-50">
            {csvState==='loading' ? <Loader2 size={14} className="animate-spin"/> :
             csvState==='done'    ? <CheckCircle size={14} className="text-green-400"/> :
             <Download size={14}/>}
            {csvState==='loading'?'Exporting…':csvState==='done'?'Exported!':'Export Full CSV'}
          </button>
        </div>
      </div>

      {/* Tabs for in-page report previews */}
      <div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all"
              style={{
                background: activeTab===t.key ? 'rgba(37,99,235,0.25)' : 'rgba(15,23,42,0.6)',
                border: `1px solid ${activeTab===t.key ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.1)'}`,
                color: activeTab===t.key ? '#93c5fd' : '#475569',
              }}>{t.label}</button>
          ))}
        </div>

        {activeTab==='overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <SectionCard icon={Factory} accent="#2563eb" title="Production Summary" rows={[
              ['Wafers Produced',`${reportData.production.wafersProduced.toLocaleString('en-IN')} units`],
              ['Target',`${reportData.production.wafersTarget.toLocaleString('en-IN')} units`],
              ['Achievement',`${reportData.production.efficiency}%`],
              ['Cycle Time',`${reportData.production.cycleTime} hrs`],
              ['Throughput',`${reportData.production.throughput.toLocaleString('en-IN')}/day`],
            ]}/>
            <SectionCard icon={IndianRupee} accent="#10b981" title="Financial Summary" rows={[
              ['Revenue (Jun)','₹5.60 Crore'],['Mfg Cost (Jun)','₹3.48 Crore'],
              ['Profit (Jun)','₹2.12 Crore'],['Profit Margin','37.9%'],
              ['Revenue YTD','₹29.6 Crore'],
            ]}/>
            <SectionCard icon={AlertTriangle} accent="#f59e0b" title="Defect Summary" rows={[
              ['Total Defects',`${reportData.defects.totalDefects}`],
              ['Defect Density',`${reportData.defects.defectDensity} /cm²`],
              ['Critical',`${reportData.defects.criticalDefects}`],
              ['Inspection',`${reportData.defects.inspectionCoverage}%`],
              ['Dominant','Particle (45%)'],
            ]}/>
            <SectionCard icon={ShoppingCart} accent="#8b5cf6" title="Order Summary" rows={[
              ['Total Orders','6'],['Critical Priority','1'],['Active Orders','5'],
              ['Total Revenue','₹55.9 Lakh'],['Due Today','2'],
            ]}/>
            <SectionCard icon={Cpu} accent="#8b5cf6" title="Machine Status" rows={[
              ['Total',`${reportData.machines.totalMachines}`],['Running',`${reportData.machines.running}`],
              ['Idle',`${reportData.machines.idle}`],['Maintenance',`${reportData.machines.maintenance}`],
              ['Avg Uptime',`${reportData.machines.avgUptime}%`],
            ]}/>
            <SectionCard icon={Wind} accent="#06b6d4" title="Environment Status" rows={[
              ['Temperature',reportData.environment.temperature],['Humidity',reportData.environment.humidity],
              ['Clean Room',reportData.environment.cleanRoomClass],['Air Quality',reportData.environment.airQuality],
              ['Particle Count',reportData.environment.particleCount],
            ]}/>
          </div>
        )}

        {activeTab==='financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#10b981,transparent)' }}/>
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <IndianRupee size={14} className="text-green-400"/>Revenue vs Mfg Cost (INR)
              </h2>
              <p className="text-[10px] text-slate-500 mb-3">Jan – Jun 2024</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={financialData} margin={{ top:5, right:10, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:'#475569' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>formatINR(v)}/>
                  <Tooltip content={<FabTooltip/>}/>
                  <Bar dataKey="revenue" name="Revenue" fill="rgba(16,185,129,0.7)" radius={[4,4,0,0]} maxBarSize={32}
                    style={{ filter:'drop-shadow(0 0 4px rgba(16,185,129,0.4))' }}/>
                  <Bar dataKey="cost" name="Cost" fill="rgba(239,68,68,0.5)" radius={[4,4,0,0]} maxBarSize={32}
                    style={{ filter:'drop-shadow(0 0 4px rgba(239,68,68,0.3))' }}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#8b5cf6,transparent)' }}/>
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BarChart2 size={14} className="text-purple-400"/>Cost Breakdown
              </h2>
              <div className="flex justify-center mb-3">
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={finPie} cx="50%" cy="50%" outerRadius={55} innerRadius={35}
                      dataKey="value" strokeWidth={0} paddingAngle={3}>
                      {finPie.map((d,i) => <Cell key={i} fill={d.color} style={{ filter:`drop-shadow(0 0 4px ${d.color}60)` }}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {finPie.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background:d.color }}/>
                      <span className="text-[10px] text-slate-400">{d.name}</span>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color:d.color }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab==='production' && (
          <SectionCard icon={Factory} accent="#2563eb" title="Production Report — Full Data" rows={[
            ['Wafers Produced',`${reportData.production.wafersProduced.toLocaleString('en-IN')} units`],
            ['Target',`${reportData.production.wafersTarget.toLocaleString('en-IN')} units`],
            ['Achievement',`${reportData.production.efficiency}%`],
            ['Cycle Time',`${reportData.production.cycleTime} hrs`],
            ['Throughput',`${reportData.production.throughput.toLocaleString('en-IN')} wafers/day`],
            ['On Hold',`${reportData.production.onHold} wafers`],
            ['Revenue Est','₹5.60 Crore'],['Cost/Wafer Est','₹2,784'],
            ['Lithography %','95%'],['Etching %','88%'],['Deposition %','92%'],['Packaging %','80%'],
          ]}/>
        )}

        {activeTab==='defects' && (
          <SectionCard icon={AlertTriangle} accent="#f59e0b" title="Defect Analysis Report" rows={[
            ['Total Defects','356'],['Defect Density','0.028 /cm²'],['Critical','38'],
            ['Inspection Coverage','98.4%'],['Particle Defects','128 (45%)'],
            ['Pattern Defects','98 (35%)'],['Alignment Defects','56 (20%)'],
            ['Dominant Stage','Lithography'],['Wafer Center Density','0.012 /cm²'],
            ['Edge Zone Density','0.048 /cm²'],['Capture Rate (Final)','98%'],
            ['Est. Defect Cost','₹6.54 Lakh/month'],
          ]}/>
        )}

        {activeTab==='orders' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(59,130,246,0.1)' }}>
              <h2 className="text-sm font-bold text-white">Order Report — All Active Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full fab-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Progress</th><th>Status</th><th>Revenue</th><th>Delivery</th></tr></thead>
                <tbody>
                  {[
                    ['ORD-001','Samsung Semiconductor','5nm FinFET Logic','78%','In Fab','₹1.82 Cr','30 Jun 2024'],
                    ['ORD-002','TSMC Alliance','14nm RF Chips','45%','Lithography','₹1.45 Cr','08 Jul 2024'],
                    ['ORD-003','Intel Foundry','28nm Power IC','92%','Testing','₹1.08 Cr','24 Jun 2024'],
                    ['ORD-004','Qualcomm Fab','7nm Mobile SoC','22%','Raw Wafer','₹74 Lakh','20 Jul 2024'],
                    ['ORD-005','NXP Technologies','180nm Automotive','99%','Packaging','₹32 Lakh','22 Jun 2024'],
                    ['ORD-006','Infineon Systems','65nm Mixed Signal','0%','Queued','₹19 Lakh','01 Aug 2024'],
                  ].map(r => (
                    <tr key={r[0]}>
                      {r.map((c,i) => <td key={i} className={i===3?'font-bold text-cyan-300':''}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
