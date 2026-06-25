import React from 'react'

export default function PageHero({ src, badge, title, accent, sub, children }) {
  return (
    <div style={{
      position:'relative', overflow:'hidden', minHeight:200,
      display:'flex', alignItems:'flex-end',
      marginBottom:32, borderRadius:'0 0 20px 20px',
      boxShadow:'0 4px 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`url('${src}')`,
        backgroundSize:'cover', backgroundPosition:'center', zIndex:0,
      }}/>
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        background:'linear-gradient(to top,rgba(5,10,30,0.92) 0%,rgba(5,10,30,0.60) 55%,rgba(5,10,30,0.28) 100%)',
      }}/>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, zIndex:2,
        background:'linear-gradient(90deg,#2563eb,#0891b2,#7c3aed)' }}/>
      <div style={{ position:'relative', zIndex:2, padding:'28px 36px', width:'100%' }}>
        {badge && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6, marginBottom:8,
            fontSize:'0.65rem', fontWeight:700, color:'#93c5fd',
            textTransform:'uppercase', letterSpacing:'0.12em',
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80',
              animation:'pulseSoft 1.6s ease-in-out infinite', display:'inline-block' }}/>
            {badge}
          </div>
        )}
        <h1 style={{
          fontFamily:"'Space Grotesk',sans-serif",
          fontSize:'clamp(1.4rem,2.8vw,2rem)', fontWeight:800,
          color:'#fff', lineHeight:1.2, marginBottom: sub ? 8 : 0,
          textShadow:'0 2px 16px rgba(0,0,0,0.5)',
        }}>
          {title}{accent && <span style={{ color:'#60a5fa' }}> {accent}</span>}
        </h1>
        {sub && (
          <p style={{ fontSize:'0.82rem', color:'rgba(203,213,225,0.85)',
            marginTop:6, maxWidth:560, lineHeight:1.6 }}>{sub}</p>
        )}
        {children && <div style={{ marginTop:14 }}>{children}</div>}
      </div>
    </div>
  )
}
