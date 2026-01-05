import { useState } from 'react'    
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'



export default function Sitebar() {
 const [mobileOpen, setMobileOpen] = useState(false)

   const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
   {/* ================= NAVBAR ================= */}
<nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-gray-900">
        Stuhdee
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center space-x-8">
        <button
          onClick={() => scrollToSection('features')}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          Features
        </button>
        <button
          onClick={() => scrollToSection('pricing')}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          Pricing
        </button>
        <Link href="/login" className="text-gray-600 hover:text-gray-900">
          Sign in
        </Link>
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Start free trial
        </Link>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden text-gray-700"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </div>
  </div>

  {/* Mobile Menu */}
  <motion.div
    initial={false}
    animate={mobileOpen ? 'open' : 'closed'}
    variants={{
      open: { height: 'auto', opacity: 1 },
      closed: { height: 0, opacity: 0 },
    }}
    transition={{ duration: 0.25 }}
    className="md:hidden overflow-hidden border-t bg-white"
  >
    <div className="px-6 py-4 space-y-4">
      <button
        onClick={() => {
          scrollToSection('features')
          setMobileOpen(false)
        }}
        className="block w-full text-left text-gray-700 text-lg"
      >
        Features
      </button>

      <button
        onClick={() => {
          scrollToSection('pricing')
          setMobileOpen(false)
        }}
        className="block w-full text-left text-gray-700 text-lg"
      >
        Pricing
      </button>

      <Link
        href="/login"
        onClick={() => setMobileOpen(false)}
        className="block text-gray-700 text-lg"
      >
        Sign in
      </Link>

      <Link
        href="/signup"
        onClick={() => setMobileOpen(false)}
        className="block bg-blue-600 text-white text-center py-3 rounded-lg font-semibold"
      >
        Start free trial
      </Link>
    </div>
  </motion.div>
</nav>
</>
  )
}
