import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, LineChart, Brain, MessageSquareMore, UserCircle } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { icon: Heart, label: 'Home', path: '/home' },
    { icon: LineChart, label: 'Analysis', path: '/analysis' },
    { icon: Brain, label: 'Growth', path: '/growth' },
    { icon: MessageSquareMore, label: 'Assistant', path: '/assistant' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-lg border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 transition-all duration-300 ${
                  isActive
                    ? 'text-primary-500 scale-110 font-medium'
                    : 'text-gray-500 hover:text-primary-400 hover:scale-105'
                }`
              }
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}