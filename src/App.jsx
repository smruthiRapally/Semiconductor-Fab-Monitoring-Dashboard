import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import Production from './pages/Production'
import Machines from './pages/Machines'
import YieldAnalysis from './pages/YieldAnalysis'
import DefectAnalysis from './pages/DefectAnalysis'
import Environment from './pages/Environment'
import Reports from './pages/Reports'
import Materials from './pages/Materials'
import Revenue from './pages/Revenue'
import CustomerOrders from './pages/CustomerOrders'

function AppContent() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/'

  return (
    <div className="app-shell">
      <TopNav />
      <main className="flex-1">
        {isDashboard ? (
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        ) : (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
            <Routes>
              <Route path="/production"  element={<Production />} />
              <Route path="/machines"    element={<Machines />} />
              <Route path="/yield"       element={<YieldAnalysis />} />
              <Route path="/defects"     element={<DefectAnalysis />} />
              <Route path="/environment" element={<Environment />} />
              <Route path="/reports"     element={<Reports />} />
              <Route path="/materials"   element={<Materials />} />
              <Route path="/revenue"     element={<Revenue />} />
              <Route path="/orders"      element={<CustomerOrders />} />
            </Routes>
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
