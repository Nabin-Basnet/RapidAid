import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Components/NavBar'
import Footer from '../Components/Footer'

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation */}
      <Navbar />

      {/* Main content area expands to push footer down */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer stays at bottom even if content is short */}
      <Footer />
    </div>
  )
}