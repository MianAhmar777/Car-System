import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Car, Bell, User, LogOut, Shield, FileCheck, ClipboardList, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Drive<span className="text-sky-600">Elite</span></span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">Car Rental System</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <Link to="/cars" className="hover:text-sky-600 transition-colors">Explore Vehicles</Link>
          {user && user.role === 'CUSTOMER' && (
            <>
              <Link to="/customer/bookings" className="hover:text-sky-600 transition-colors">My Bookings</Link>
              <Link to="/customer/documents" className="hover:text-sky-600 transition-colors">Documents</Link>
            </>
          )}
          {user && (user.role === 'STAFF' || user.role === 'ADMIN') && (
            <Link to={user.role === 'ADMIN' ? "/admin" : "/staff"} className="text-sky-600 font-semibold flex items-center gap-1.5 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
              <Shield className="w-4 h-4" />
              {user.role} Workspace
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {user.fullName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-sky-100 text-sky-800">
                      {user.role}
                    </span>
                  </div>

                  {user.role === 'CUSTOMER' && (
                    <>
                      <Link to="/customer/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Customer Dashboard</Link>
                      <Link to="/customer/bookings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Reservations</Link>
                      <Link to="/customer/documents" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Documents</Link>
                    </>
                  )}

                  {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                    <Link to={user.role === 'ADMIN' ? "/admin" : "/staff"} className="block px-4 py-2 text-sm text-sky-600 font-semibold hover:bg-sky-50">
                      Operational Portal
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors">
                Log In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-600/30 transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
