'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Products', href: '/products' },
  { name: 'About', href: '/about' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div>
        <Link href="/" className="text-xl font-bold">
          MyApp
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
