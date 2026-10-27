import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, ShieldCheck, Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-600 text-xs border-t border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">AutoRent</span>
                <span className="text-[10px] font-bold text-sky-600 tracking-wider uppercase">Marketplace PK</span>
              </div>
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm font-normal">
              Pakistan's premium car rental marketplace. Rent verified vehicles transparently with instant booking, competitive rates, and seamless online contracts.
            </p>
            <div className="pt-2 space-y-2 font-medium">
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Main Blue Area & Gulberg III, Lahore / Islamabad</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                <span>+92 300 1234567 / +92 51 9876543</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <span>support@autorent.pk</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">Company</h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link to="/about" className="hover:text-sky-600 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-sky-600 transition-colors">Explore Fleet</Link>
              </li>
              <li>
                <Link to="/about#services" className="hover:text-sky-600 transition-colors">Rental Services</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sky-600 transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">Support & Legal</h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link to="/faq" className="hover:text-sky-600 transition-colors">FAQ & Help</Link>
              </li>
              <li>
                <Link to="/rental-policy" className="hover:text-sky-600 transition-colors">Rental Policy</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-sky-600 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-sky-600 transition-colors">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Customer Portal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">Customer Portal</h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link to="/login" className="hover:text-sky-600 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-sky-600 transition-colors">Create Account</Link>
              </li>
              <li>
                <Link to="/customer/bookings" className="hover:text-sky-600 transition-colors">My Bookings</Link>
              </li>
              <li>
                <Link to="/customer/documents" className="hover:text-sky-600 transition-colors">Identity Verification</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© {currentYear} AutoRent Car Rental System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-slate-900 cursor-pointer transition-colors"><Facebook className="w-4 h-4" /></span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors"><Twitter className="w-4 h-4" /></span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors"><Instagram className="w-4 h-4" /></span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors"><Linkedin className="w-4 h-4" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
