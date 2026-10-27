import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/axios';
import CarCard from '../components/cars/CarCard';
import CarFilters from '../components/cars/CarFilters';
import { CarSkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Car, AlertCircle } from 'lucide-react';

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState('recommended'); // recommended, cheapest, expensive, newest

  // Extract filter values from URL params
  const filters = useMemo(() => ({
    categoryId: searchParams.get('categoryId') || '',
    locationId: searchParams.get('locationId') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    transmission: searchParams.get('transmission') || '',
    fuelType: searchParams.get('fuelType') || '',
    seatingCapacity: searchParams.get('seatingCapacity') || '',
    search: searchParams.get('search') || '',
    pickupDate: searchParams.get('pickupDate') || '',
    returnDate: searchParams.get('returnDate') || '',
  }), [searchParams]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/categories'),
          api.get('/locations'),
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (locRes.success) setLocations(locRes.data);
      } catch (e) {}
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.locationId) params.append('locationId', filters.locationId);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.transmission) params.append('transmission', filters.transmission);
        if (filters.fuelType) params.append('fuelType', filters.fuelType);
        if (filters.seatingCapacity) params.append('seatingCapacity', filters.seatingCapacity);
        if (filters.search) params.append('search', filters.search);
        if (filters.pickupDate) params.append('pickupDate', filters.pickupDate);
        if (filters.returnDate) params.append('returnDate', filters.returnDate);

        const res = await api.get(`/cars?${params.toString()}`);
        if (res.success) {
          setCars(res.data);
        }
      } catch (e) {
        setError(e.message || 'Failed to fetch vehicles from API.');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [filters]);

  const updateFilter = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set(key, val);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  // Client-side sorting algorithm
  const sortedCars = useMemo(() => {
    const list = [...cars];
    if (sortBy === 'cheapest') {
      return list.sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));
    }
    if (sortBy === 'expensive') {
      return list.sort((a, b) => Number(b.dailyRate) - Number(a.dailyRate));
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list; // recommended
  }, [cars, sortBy]);

  return (
    <PublicLayout>
      <SEO
        title="Browse Rental Fleet & Luxury Cars | DriveElite"
        description="Explore our luxury and economy rental fleet across Pakistan. Instant online reservations, real-time rates in PKR, transparent pricing, and paperless e-contracts."
        canonicalPath="/cars"
      />
      <div className="bg-white text-slate-900 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Marketplace Fleet</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-1">Explore Available Cars</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Compare rental options with real-time PKR daily rates, specifications, and instant paperless contract eligibility.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* TOP CONTROLS BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden px-4 py-2.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <span className="text-xs font-bold text-slate-700">
              {loading ? 'Searching...' : `${sortedCars.length} Vehicles Found`}
            </span>
          </div>

          {/* Sorting Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="recommended">Recommended</option>
              <option value="cheapest">Cheapest First</option>
              <option value="expensive">Most Expensive</option>
              <option value="newest">Newest Fleet</option>
            </select>
          </div>
        </div>

        {/* MAIN MARKETPLACE GRID */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs h-fit sticky top-24">
            <CarFilters
              filters={filters}
              onFilterChange={updateFilter}
              onReset={handleReset}
              categories={categories}
              locations={locations}
            />
          </div>

          {/* Vehicles Marketplace Display */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <CarSkeletonCard />
                <CarSkeletonCard />
                <CarSkeletonCard />
                <CarSkeletonCard />
                <CarSkeletonCard />
                <CarSkeletonCard />
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-8 rounded-2xl text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
                <h3 className="font-bold text-sm">API Connection Error</h3>
                <p className="text-xs text-rose-600">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl"
                >
                  Reset Search
                </button>
              </div>
            ) : sortedCars.length === 0 ? (
              <EmptyState
                icon={Car}
                title="No Vehicles Matched Your Criteria"
                description="Try adjusting your dual PKR price range, category, transmission, or date range."
                actionLabel="Reset All Filters"
                onAction={handleReset}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-sky-600" /> Filter Vehicles
                </h3>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <CarFilters
                filters={filters}
                onFilterChange={updateFilter}
                onReset={handleReset}
                categories={categories}
                locations={locations}
              />
            </div>

            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="w-full py-3 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30"
            >
              Apply Filters ({sortedCars.length} Cars)
            </button>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
