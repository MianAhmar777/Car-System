import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Car, Menu, X, User, LogOut, Shield, LayoutDashboard, Calendar, ChevronRight, ChevronDown, FileText, CheckCircle2 } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPortalLink = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') return { label: 'Admin Portal', path: '/admin' };
    if (user.role === 'STAFF') return { label: 'Staff Portal', path: '/staff' };
    return { label: 'My Dashboard', path: '/customer/dashboard' };
  };

  const portal = getPortalLink();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">AutoRent</span>
            <span className="text-[10px] font-bold text-sky-600 tracking-wider uppercase">Marketplace PK</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive('/') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Home
          </Link>
          <Link
            to="/cars"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive('/cars') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Browse Cars
          </Link>
          <Link
            to="/about"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive('/about') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            About Us
          </Link>
          <Link
            to="/faq"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive('/faq') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isActive('/contact') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Right CTAs & Auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'CUSTOMER' && (
                <Link
                  to="/customer/bookings"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/customer/bookings')
                      ? 'text-sky-600 bg-sky-50 border border-sky-200'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  My Bookings
                </Link>
              )}
              {portal && (
                <Link
                  to={portal.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive(portal.path)
                      ? 'text-sky-700 bg-sky-100 border border-sky-300'
                      : 'text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
                  {portal.label}
                </Link>
              )}
              <div className="h-6 w-px bg-slate-200 mx-1" />

              {/* Interactive User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl transition-all border cursor-pointer ${
                    profileDropdownOpen
                      ? 'bg-slate-100 border-slate-300 ring-2 ring-sky-500/20 shadow-xs'
                      : 'border-slate-200/60 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  aria-expanded={profileDropdownOpen}
                  title="Click to view Account Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                      {user.fullName || user.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Popover */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Identity Header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {(user.fullName || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{user.fullName || 'Valued User'}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 uppercase tracking-wider">
                          {user.role}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-1.5 space-y-0.5 text-xs font-semibold text-slate-700">
                      <Link
                        to={portal ? portal.path : '/customer/dashboard'}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sky-600" />
                        <span>My Dashboard & Profile</span>
                      </Link>

                      {user.role === 'CUSTOMER' && (
                        <Link
                          to="/customer/bookings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-sky-600" />
                          <span>My Bookings & Invoices</span>
                        </Link>
                      )}
                    </div>

                    {/* Sign Out Action */}
                    <div className="p-1.5 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-sky-600 border border-sky-200 hover:bg-sky-50 rounded-xl transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Home
            </Link>
            <Link
              to="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Browse Cars
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              About Us
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Contact
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{user.fullName || 'User'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>

                {portal && (
                  <Link
                    to={portal.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-3 bg-sky-50 text-sky-700 border border-sky-200 font-bold text-xs rounded-xl flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-sky-600" />
                      {portal.label}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}

                {user.role === 'CUSTOMER' && (
                  <>
                    <Link
                      to="/customer/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full px-4 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-600" />
                        My Bookings & Invoices
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-3 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
