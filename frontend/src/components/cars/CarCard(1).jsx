import React from 'react';
import { Link } from 'react-router-dom';
import { formatPKR } from '../../utils/formatters';
import Badge from '../ui/Badge';
import { Users, Briefcase, DoorClosed, Settings, Snowflake, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function CarCard({ car }) {
  const primaryImage = car?.images && car.images.length > 0
    ? (car.images.find(img => img.isPrimary)?.url || car.images[0].url)
    : 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80';

  // Calculate optional discount badge if dailyRate vs original rate exists
  const hasDiscount = car.originalDailyRate && car.originalDailyRate > car.dailyRate;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Vehicle Image Container */}
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="neutral" className="bg-slate-900/80 text-white backdrop-blur-md border-0 text-[11px]">
            {car.category?.name || 'Standard'}
          </Badge>
        </div>

        {/* Status Badge */}
        {car.status !== 'AVAILABLE' && (
          <div className="absolute top-3 left-3">
            <Badge variant="warning" className="text-[10px]">
              {car.status}
            </Badge>
          </div>
        )}
      </div>

      {/* Vehicle Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
              {car.make} {car.model}
            </h3>
            <span className="text-xs font-semibold text-slate-400">{car.year}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {car.category?.name || 'Vehicle'} • {car.color || 'White'}
          </p>
        </div>

        {/* Specifications Icon Row */}
        <div className="grid grid-cols-4 gap-1 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-700">
          <div className="flex items-center gap-1.5" title="Seats">
            <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>{car.seatingCapacity || 4}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Bags">
            <Briefcase className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>1 Bag</span>
          </div>
          <div className="flex items-center gap-1.5" title="Doors">
            <DoorClosed className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>{car.doors || 4}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Transmission">
            <Settings className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="capitalize">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
          </div>
        </div>

        {/* Feature Badges Row */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
            <ShieldCheck className="w-3 h-3" /> Theft Protection
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
            Clean Interior
          </span>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through block leading-none">
                {formatPKR(car.originalDailyRate)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 leading-none">
                {formatPKR(car.dailyRate)}
              </span>
              <span className="text-[11px] font-medium text-slate-500">/ Day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/cars/${car.id}`}
              className="px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm shadow-sky-600/20 flex items-center gap-1"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
