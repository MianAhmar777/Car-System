import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SEO from '../seo/SEO';
import { buildProductSchema } from '../seo/structuredData';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/axios';
import { formatPKR, getTodayDateStr, getTomorrowDateStr } from '../utils/formatters';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { Car, Calendar, MapPin, Users, Briefcase, DoorClosed, Settings, Fuel, ShieldCheck, CheckCircle2, Star, ArrowRight, AlertCircle, Clock } from 'lucide-react';

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery Active Image
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Date Selection & Availability State
  const todayStr = getTodayDateStr();
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(getTomorrowDateStr(todayStr));
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null); // null, true, false
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/cars/${id}`);
        if (res.success) {
          setCar(res.data);
        }
      } catch (e) {
        setError(e.message || 'Vehicle details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  // Check Availability using actual backend cars filter endpoint
  const checkAvailability = async () => {
    if (!pickupDate || !returnDate) {
      setAvailabilityMessage('Please select both pickup and return dates.');
      setIsAvailable(false);
      return;
    }
    if (pickupDate < todayStr) {
      setAvailabilityMessage('Pickup date cannot be in the past. Please select today or a future date.');
      setIsAvailable(false);
      return;
    }
    if (new Date(pickupDate) >= new Date(returnDate)) {
      setAvailabilityMessage('Return date must be strictly after pickup date.');
      setIsAvailable(false);
      return;
    }

    setAvailabilityChecking(true);
    setAvailabilityMessage('');
    try {
      const res = await api.get(`/cars?pickupDate=${pickupDate}&returnDate=${returnDate}`);
      if (res.success) {
        const matchingCar = res.data.find((c) => c.id === id);
        if (matchingCar) {
          setIsAvailable(true);
          setAvailabilityMessage('Vehicle is AVAILABLE for your selected dates!');
        } else {
          setIsAvailable(false);
          setAvailabilityMessage('Vehicle is UNAVAILABLE due to existing booking/maintenance during these dates.');
        }
      }
    } catch (e) {
      setIsAvailable(false);
      setAvailabilityMessage(e.message || 'Could not verify date availability.');
    } finally {
      setAvailabilityChecking(false);
    }
  };

  // Calculate Days & Itemized Total
  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 1;
    const diff = new Date(returnDate) - new Date(pickupDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const rentalDays = calculateDays();
  const subtotal = car ? car.dailyRate * rentalDays : 0;
  const securityDeposit = car?.securityDeposit || 10000;
  const grandTotal = subtotal + securityDeposit;

  const handleProceedToBooking = () => {
    const params = new URLSearchParams();
    params.append('carId', id);
    if (pickupDate) params.append('pickupDate', pickupDate);
    if (returnDate) params.append('returnDate', returnDate);
    navigate(`/booking?${params.toString()}`);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-pulse">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !car) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Vehicle Details Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Vehicle not found.'}</p>
          <Link to="/cars" className="inline-block px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl">
            Return to Fleet Marketplace
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const imagesList = car.images && car.images.length > 0
    ? car.images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80'];

  const carTitle = car ? `${car.make} ${car.model} (${car.year})` : 'Vehicle Details';
  const carDesc = car ? `Rent ${car.make} ${car.model} ${car.year} in ${car.location?.city || car.location?.name || 'Pakistan'} for ${formatPKR(car.dailyRate)}/day. Instant paperless booking and transparent pricing.` : '';
  const carImage = imagesList[0];
  const productSchema = car ? buildProductSchema({
    name: carTitle,
    description: car.description || carDesc,
    image: carImage,
    brand: car.make,
    model: car.model,
    year: car.year,
    dailyRate: car.dailyRate,
    availability: car.status === 'AVAILABLE' ? 'InStock' : 'OutOfStock',
    url: `/cars/${car.id}`,
    category: car.category?.name,
  }) : null;

  return (
    <PublicLayout>
      {car && (
        <SEO
          title={`${carTitle} Rental | DriveElite`}
          description={carDesc}
          canonicalPath={`/cars/${car.id}`}
          ogImage={carImage}
          ogType="product"
          structuredData={productSchema}
        />
      )}
      {/* Top Banner Header */}
      <div className="bg-white text-slate-900 py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" className="bg-sky-50 text-sky-700 border-sky-200 text-[11px]">
                {car.category?.name || 'Standard'}
              </Badge>
              <span className="text-xs text-slate-500 font-semibold">{car.registrationNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-1">
              {car.make} {car.model} ({car.year})
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Daily Rate</span>
            <span className="text-2xl font-black text-slate-900">{formatPKR(car.dailyRate)}</span>
            <span className="text-xs text-slate-500"> / day</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* GALLERY & BOOKING SIDEBAR */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Gallery Display */}
            <div className="space-y-3">
              <div className="h-96 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xs relative">
                <img
                  src={imagesList[activeImageIndex]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>

              {/* Thumbnail Bar */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx ? 'border-sky-600 ring-2 ring-sky-500/20' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Grid */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Vehicle Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Users className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Capacity</span>
                    <span className="font-bold text-slate-900">{car.seatingCapacity || 4} Seats</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Briefcase className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Luggage</span>
                    <span className="font-bold text-slate-900">1 Large Bag</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <DoorClosed className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Doors</span>
                    <span className="font-bold text-slate-900">{car.doors || 4} Doors</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Settings className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Transmission</span>
                    <span className="font-bold text-slate-900 capitalize">{car.transmission || 'Automatic'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Fuel className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Fuel Type</span>
                    <span className="font-bold text-slate-900 capitalize">{car.fuelType || 'Petrol'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Color</span>
                    <span className="font-bold text-slate-900">{car.color || 'White'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Included Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Included Vehicle Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {car.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Description & Rental Notes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {car.description || 'Clean, well-maintained rental vehicle. Fully insured with digital contract support and 24/7 roadside assistance.'}
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Availability & Booking Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-6 sticky top-24">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" /> Check Date Availability
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Pickup Date</label>
                  <span className="text-[10px] text-slate-400">Min: Today</span>
                </div>
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => {
                    const newPickup = e.target.value;
                    setPickupDate(newPickup);
                    setIsAvailable(null);
                    if (returnDate && returnDate <= newPickup) {
                      setReturnDate(getTomorrowDateStr(newPickup));
                    }
                  }}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Return Date</label>
                  <span className="text-[10px] text-slate-400">Min: After pickup</span>
                </div>
                <input
                  type="date"
                  min={getTomorrowDateStr(pickupDate || todayStr)}
                  value={returnDate}
                  onChange={(e) => {
                    setReturnDate(e.target.value);
                    setIsAvailable(null);
                  }}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="button"
                onClick={checkAvailability}
                disabled={availabilityChecking}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all border border-slate-200"
              >
                {availabilityChecking ? 'Checking Availability...' : 'Validate Dates'}
              </button>

              {availabilityMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {availabilityMessage}
                </div>
              )}
            </div>

            {/* Price Itemization Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Price Breakdown</h4>
              <div className="flex justify-between text-slate-600">
                <span>Daily Rate ({rentalDays} Days)</span>
                <span className="font-semibold text-slate-900">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Refundable Security Deposit</span>
                <span className="font-semibold text-slate-900">{formatPKR(securityDeposit)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-bold text-sm text-slate-900">
                <span>Estimated Total</span>
                <span className="text-xl font-black text-sky-600">{formatPKR(grandTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToBooking}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Booking Stepper <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
