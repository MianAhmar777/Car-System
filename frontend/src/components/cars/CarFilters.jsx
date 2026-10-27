import React from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';
import { formatPKR } from '../../utils/formatters';

export default function CarFilters({
  filters,
  onFilterChange,
  onReset,
  categories = [],
  locations = [],
  minPriceLimit = 3000,
  maxPriceLimit = 50000,
}) {
  const handleRangeChange = (e) => {
    onFilterChange('maxPrice', e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-600" /> Filter Vehicles
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Search Keywords */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">Search Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Make or model e.g. Toyota..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>
      </div>

      {/* Dual PKR Price Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
          <span>Price Range</span>
          <span className="text-sky-600 font-black">
            Up to {formatPKR(filters.maxPrice || maxPriceLimit)}
          </span>
        </div>
        <input
          type="range"
          min={minPriceLimit}
          max={maxPriceLimit}
          step={500}
          value={filters.maxPrice || maxPriceLimit}
          onChange={handleRangeChange}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
          <span>{formatPKR(minPriceLimit)}</span>
          <span>{formatPKR(maxPriceLimit)}+</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">Category</label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
            <input
              type="radio"
              name="categoryId"
              checked={!filters.categoryId}
              onChange={() => onFilterChange('categoryId', '')}
              className="accent-sky-600"
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
              <input
                type="radio"
                name="categoryId"
                checked={filters.categoryId === cat.id}
                onChange={() => onFilterChange('categoryId', cat.id)}
                className="accent-sky-600"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">Pickup Location</label>
        <select
          value={filters.locationId || ''}
          onChange={(e) => onFilterChange('locationId', e.target.value)}
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.city})
            </option>
          ))}
        </select>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">Transmission</label>
        <div className="grid grid-cols-2 gap-2">
          {['', 'AUTOMATIC', 'MANUAL'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onFilterChange('transmission', t)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                (filters.transmission || '') === t
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t === '' ? 'All' : t === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">Fuel Type</label>
        <select
          value={filters.fuelType || ''}
          onChange={(e) => onFilterChange('fuelType', e.target.value)}
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="">All Fuel Types</option>
          <option value="PETROL">Petrol</option>
          <option value="DIESEL">Diesel</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ELECTRIC">Electric</option>
        </select>
      </div>

      {/* Seating Capacity */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">Seating Capacity</label>
        <select
          value={filters.seatingCapacity || ''}
          onChange={(e) => onFilterChange('seatingCapacity', e.target.value)}
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="">Any Capacity</option>
          <option value="2">2 Seats or more</option>
          <option value="4">4 Seats or more</option>
          <option value="5">5 Seats or more</option>
          <option value="7">7 Seats or more</option>
        </select>
      </div>
    </div>
  );
}
