import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/axios';
import { formatPKR, getTodayDateStr, getTomorrowDateStr, getCarImageUrl } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import SignaturePad from '../components/SignaturePad';
import { Car, Calendar, MapPin, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, CreditCard, FileText, Check, AlertCircle, RefreshCw, X, Search, Landmark, Banknote, UploadCloud, Copy, Trash2, Building2 } from 'lucide-react';

export default function BookingFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useNotification();

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr(todayStr);

  const carId = searchParams.get('carId');
  const initialPickupRaw = searchParams.get('pickupDate') || '';
  const initialReturnRaw = searchParams.get('returnDate') || '';

  // Prevent past dates from URL query params
  const initialPickup = initialPickupRaw && initialPickupRaw >= todayStr ? initialPickupRaw : todayStr;
  const initialReturn = initialReturnRaw && initialReturnRaw > initialPickup ? initialReturnRaw : getTomorrowDateStr(initialPickup);

  const [currentStep, setCurrentStep] = useState(1);
  const [car, setCar] = useState(null);
  const [locations, setLocations] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  // Vehicle Switcher State
  const [allCars, setAllCars] = useState([]);
  const [showCarModal, setShowCarModal] = useState(false);
  const [carSearchTerm, setCarSearchTerm] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Form State
  const [pickupLocationId, setPickupLocationId] = useState('');
  const [returnLocationId, setReturnLocationId] = useState('');
  const [pickupDate, setPickupDate] = useState(initialPickup);
  const [returnDate, setReturnDate] = useState(initialReturn);
  const [selectedServices, setSelectedServices] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // Booking Results State
  const [createdBooking, setCreatedBooking] = useState(null);
  const [createdContract, setCreatedContract] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [maxStepReached, setMaxStepReached] = useState(1);

  // Payment System State: 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD'
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [bankTxnId, setBankTxnId] = useState('');
  const [bankSenderName, setBankSenderName] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Credit Card mock inputs
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard!`, 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSlipChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('Slip file exceeds 10MB limit. Please upload a smaller file.', 'error');
      return;
    }
    setSlipFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSlipPreview(url);
    } else {
      setSlipPreview(null);
    }
  };

  const removeSlip = () => {
    setSlipFile(null);
    if (slipPreview) {
      URL.revokeObjectURL(slipPreview);
      setSlipPreview(null);
    }
  };

  useEffect(() => {
    setMaxStepReached((prev) => Math.max(prev, currentStep));
  }, [currentStep]);

  const handleStepClick = (targetStep) => {
    if (targetStep === currentStep) return;

    if (targetStep <= maxStepReached || targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      showToast(
        `Please complete the current steps before proceeding to ${
          steps.find((s) => s.num === targetStep)?.label || 'this step'
        }.`,
        'info',
      );
    }
  };

  const handleSelectVehicle = (newCar) => {
    setCar(newCar);
    setShowCarModal(false);
    setBookingError('');
    setCreatedBooking(null);
    setCreatedContract(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('carId', newCar.id);
    navigate(`/booking?${newParams.toString()}`, { replace: true });
    showToast(`Vehicle updated to ${newCar.make} ${newCar.model}`, 'success');
  };

  const filteredCars = allCars.filter((c) => {
    const term = carSearchTerm.trim().toLowerCase();
    if (!term) return c.status === 'AVAILABLE' || c.isAvailable !== false;
    const match = `${c.make} ${c.model} ${c.category?.name || ''} ${c.transmission || ''}`
      .toLowerCase()
      .includes(term);
    return match && (c.status === 'AVAILABLE' || c.isAvailable !== false);
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      showToast('Please log in to proceed with booking.', 'info');
      const target = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    const fetchData = async () => {
      try {
        if (carId) {
          const carRes = await api.get(`/cars/${carId}`);
          if (carRes.success) setCar(carRes.data);
        }
        const [locRes, srvRes, carsRes] = await Promise.all([
          api.get('/locations'),
          api.get('/services'),
          api.get('/cars'),
        ]);
        if (locRes.success) {
          setLocations(locRes.data);
          if (locRes.data.length > 0) {
            setPickupLocationId(locRes.data[0].id);
            setReturnLocationId(locRes.data[0].id);
          }
        }
        if (srvRes.success) setServicesList(srvRes.data);
        if (carsRes.success) {
          setAllCars(carsRes.data);
          if (!carId && carsRes.data.length > 0) {
            setCar(carsRes.data[0]);
          }
        }
      } catch (e) {}
    };
    fetchData();
  }, [carId, user]);

  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 1;
    const diff = new Date(returnDate) - new Date(pickupDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const rentalDays = calculateDays();
  const rentalTotal = car ? car.dailyRate * rentalDays : 0;
  const servicesTotal = selectedServices.reduce((sum, sId) => {
    const s = servicesList.find((srv) => srv.id === sId);
    return sum + (s ? s.price : 0);
  }, 0);
  const securityDeposit = car?.securityDeposit || 10000;
  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const finalGrandTotal = Math.max(0, rentalTotal + servicesTotal + securityDeposit - discountAmount);

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  // Create Booking API Submission
  const handleCreateBooking = async () => {
    if (!pickupDate || !returnDate) {
      showToast('Please select valid pickup and return dates.', 'error');
      return;
    }
    if (pickupDate < todayStr) {
      showToast('Pickup date cannot be in the past.', 'error');
      return;
    }
    if (returnDate <= pickupDate) {
      showToast('Return date must be strictly after pickup date.', 'error');
      return;
    }

    setSubmitting(true);
    setBookingError('');
    try {
      const res = await api.post('/bookings', {
        carId: car?.id || carId,
        pickupLocationId,
        returnLocationId,
        pickupDateTime: new Date(`${pickupDate}T10:00:00Z`).toISOString(),
        returnDateTime: new Date(`${returnDate}T10:00:00Z`).toISOString(),
        serviceIds: selectedServices,
      });

      if (res.success) {
        setCreatedBooking(res.data);
        setBookingError('');
        showToast('Reservation created successfully!', 'success');
        setCurrentStep(5); // Proceed to Payment & Contract
      }
    } catch (e) {
      const msg = e.message || 'Failed to create booking reservation.';
      setBookingError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Payment API Call
  const handlePayment = async () => {
    if (!createdBooking) {
      showToast('No active reservation found. Please complete Step 4 first.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let res;

      if (paymentMethod === 'BANK_TRANSFER') {
        if (!slipFile && !bankTxnId) {
          showToast('Please upload your payment slip/receipt or provide a transaction ID.', 'warning');
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('bookingId', createdBooking.id);
        formData.append('amount', String(finalGrandTotal));
        if (bankTxnId) formData.append('transactionId', bankTxnId);
        formData.append('bankName', 'Meezan Bank');
        if (bankSenderName) formData.append('senderAccount', bankSenderName);
        if (slipFile) formData.append('slip', slipFile);

        res = await api.post('/payments/bank-transfer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (paymentMethod === 'CASH') {
        res = await api.post('/payments', {
          bookingId: createdBooking.id,
          amount: finalGrandTotal,
          provider: 'CASH',
          transactionId: `COD-${Date.now()}`,
        });
      } else {
        // CREDIT_CARD
        if (!cardNumber || !cardExpiry || !cardCvc) {
          showToast('Please enter your card number, expiry, and CVC.', 'warning');
          setSubmitting(false);
          return;
        }
        res = await api.post('/payments', {
          bookingId: createdBooking.id,
          amount: finalGrandTotal,
          provider: 'CREDIT_CARD',
          transactionId: `CARD-${Date.now()}`,
        });
      }

      if (res.success) {
        showToast('Payment confirmed! Generating official rental contract...', 'success');
        // Generate Contract
        try {
          const contractRes = await api.post(`/contracts/generate/${createdBooking.id}`);
          if (contractRes.success) {
            setCreatedContract(contractRes.data);
          }
        } catch (err) {
          console.warn('Contract generation note:', err);
        }

        setCurrentStep(6); // Move towards next step: E-Sign Step
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    } catch (e) {
      showToast(e.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Online E-Signature Submission
  const handleSignContract = async (signatureData) => {
    if (!createdContract) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/contracts/${createdContract.id}/sign-online`, {
        signatureData,
      });
      if (res.success) {
        showToast('Rental contract signed successfully!', 'success');
        setCurrentStep(7); // Final Confirmation
      }
    } catch (e) {
      showToast(e.message || 'E-signature submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Vehicle' },
    { num: 2, label: 'Dates & Location' },
    { num: 3, label: 'Services' },
    { num: 4, label: 'Review' },
    { num: 5, label: 'Payment' },
    { num: 6, label: 'E-Contract' },
    { num: 7, label: 'Confirmation' },
  ];

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Verifying your session...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!car) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Select a Vehicle to Begin Booking</h2>
          <p className="text-xs text-slate-500">Please choose a vehicle from the marketplace fleet first.</p>
          <Link to="/cars" className="inline-block px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl">
            Browse Marketplace Fleet
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEO title="Vehicle Reservation Checkout | DriveElite" noindex={true} />
      {/* Top Banner */}
      <div className="bg-white text-slate-900 py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Reservation Workflow</span>
            <div className="flex flex-wrap items-center gap-3 mt-0.5">
              <h1 className="text-2xl font-extrabold text-slate-900">Booking: {car.make} {car.model}</h1>
              <button
                type="button"
                onClick={() => setShowCarModal(true)}
                className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Change Vehicle
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Total Rate: <span className="text-lg font-black text-slate-900">{formatPKR(finalGrandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* PROGRESS STEPPER */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[650px] px-2">
            {steps.map((s, idx) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              const isAccessible = s.num <= maxStepReached || isPast;

              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => handleStepClick(s.num)}
                    disabled={!isAccessible && !isPast}
                    title={
                      isCurrent
                        ? `Current Step: ${s.label}`
                        : isAccessible
                        ? `Click to open Step ${s.num}: ${s.label}`
                        : `Complete previous steps first`
                    }
                    className={`flex items-center gap-2 group text-left focus:outline-none rounded-xl p-1.5 transition-all ${
                      isAccessible && !isCurrent
                        ? 'cursor-pointer hover:bg-slate-50'
                        : isCurrent
                        ? 'cursor-default'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-sky-600 text-white ring-4 ring-sky-500/20 shadow-md scale-105'
                          : isPast
                          ? 'bg-emerald-500 text-white group-hover:bg-emerald-600 group-hover:ring-4 group-hover:ring-emerald-100 group-hover:scale-105 shadow-xs'
                          : isAccessible
                          ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-400 group-hover:ring-4 group-hover:ring-sky-200 group-hover:scale-105'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                    </div>
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isCurrent
                          ? 'text-sky-600'
                          : isPast
                          ? 'text-slate-700 group-hover:text-emerald-700'
                          : isAccessible
                          ? 'text-slate-700 group-hover:text-sky-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 transition-colors ${
                        currentStep > s.num ? 'bg-emerald-400' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* STEPPER CONTENT GRID */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Step Form Area */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
            {/* STEP 1: VEHICLE SUMMARY */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 1: Vehicle Selected</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Confirm vehicle specs or switch to another available model</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCarModal(true)}
                    className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Change Vehicle
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <img
                    src={getCarImageUrl(car)}
                    alt={`${car.make} ${car.model}`}
                    className="w-full sm:w-56 h-36 object-cover rounded-xl shadow-xs"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{car.make} {car.model} ({car.year})</h3>
                        <p className="text-xs text-slate-500">{car.category?.name || 'Standard'} • {car.transmission} • {car.fuelType}</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md uppercase">
                        Selected
                      </span>
                    </div>
                    <div className="text-base font-black text-sky-600">{formatPKR(car.dailyRate)} <span className="text-xs text-slate-500 font-normal">/ day</span></div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCarModal(true)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Select a different car from fleet &rarr;
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCarModal(true)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Swap Vehicle
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    Next: Select Dates & Locations <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATES & LOCATION */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Step 2: Pickup & Return Selection</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Location</label>
                    <select
                      value={pickupLocationId}
                      onChange={(e) => setPickupLocationId(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Return Location</label>
                    <select
                      value={returnLocationId}
                      onChange={(e) => setReturnLocationId(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Pickup Date</label>
                      <span className="text-[10px] text-slate-400">Min: Today ({todayStr})</span>
                    </div>
                    <input
                      type="date"
                      min={todayStr}
                      value={pickupDate}
                      onChange={(e) => {
                        const newPickup = e.target.value;
                        if (newPickup && newPickup < todayStr) {
                          showToast('Pickup date cannot be in the past.', 'error');
                          return;
                        }
                        setPickupDate(newPickup);
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
                        const newReturn = e.target.value;
                        if (pickupDate && newReturn <= pickupDate) {
                          showToast('Return date must be after pickup date.', 'error');
                          return;
                        }
                        setReturnDate(newReturn);
                      }}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => {
                      if (!pickupDate || !returnDate) {
                        showToast('Please select valid pickup and return dates.', 'error');
                        return;
                      }
                      if (pickupDate < todayStr) {
                        showToast('Pickup date cannot be in the past.', 'error');
                        return;
                      }
                      if (returnDate <= pickupDate) {
                        showToast('Return date must be strictly after pickup date.', 'error');
                        return;
                      }
                      setCurrentStep(3);
                    }}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    Next: Additional Services <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SERVICES */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Step 3: Add Extra Services</h2>
                <div className="space-y-3">
                  {servicesList.map((srv) => {
                    const isSelected = selectedServices.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{srv.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{srv.description || 'Optional rental addon'}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 block">{formatPKR(srv.price)}</span>
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>
                            {isSelected ? 'Added' : '+ Add'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-2"
                  >
                    Next: Review Reservation <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT BOOKING */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Step 4: Review Details & Submit</h2>
                  <button
                    type="button"
                    onClick={() => setShowCarModal(true)}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Change Vehicle
                  </button>
                </div>

                {/* Inline Error Banner when booking fails or vehicle overlaps */}
                {bookingError && (
                  <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-sm">
                          {bookingError.includes('overlap') || bookingError.includes('not available')
                            ? 'Vehicle Unavailable for Selected Dates'
                            : 'Reservation Error'}
                        </p>
                        <p className="leading-relaxed opacity-95">{bookingError}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/60">
                      <button
                        type="button"
                        onClick={() => setShowCarModal(true)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Choose Different Vehicle
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-3.5 py-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Modify Rental Dates
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-700">Customer</span>
                    <span className="font-semibold text-slate-900">{user.fullName || user.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-700">Vehicle</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{car.make} {car.model}</span>
                      <button
                        type="button"
                        onClick={() => setShowCarModal(true)}
                        className="text-[11px] text-sky-600 font-bold hover:underline cursor-pointer"
                      >
                        (Change)
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-700">Dates ({rentalDays} Days)</span>
                    <span className="font-semibold text-slate-900">{pickupDate} to {returnDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Total Due</span>
                    <span className="font-black text-sky-600 text-sm">{formatPKR(finalGrandTotal)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                  </button>
                  {createdBooking ? (
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      Proceed to Payment (Step 5) <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateBooking}
                      disabled={submitting}
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Creating Reservation...' : 'Confirm Reservation'} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: PAYMENT PROCESSING */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 5: Process Rental Payment</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select your preferred payment method: Direct Bank Transfer with slip upload, or Cash on Pickup.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Step 5 of 7</span>
                </div>

                {createdContract ? (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Payment Verified & Agreement Ready</span>
                    </div>
                    <p className="text-emerald-700">
                      Payment for Reservation <code className="font-bold font-mono">#{createdBooking?.id}</code> has been confirmed. You may proceed directly to e-contract signing.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Reservation Summary Strip */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Reservation Reference:</span>
                        <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                          {createdBooking ? (createdBooking.bookingReference || `#${createdBooking.id}`) : 'Pending'}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-slate-500">Total Payable Amount:</span>
                        <p className="text-lg font-black text-sky-600">
                          {formatPKR(finalGrandTotal)}
                        </p>
                      </div>
                    </div>

                    {/* Payment Method Selector Tabs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Bank Transfer Tab */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('BANK_TRANSFER')}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                          paymentMethod === 'BANK_TRANSFER'
                            ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            paymentMethod === 'BANK_TRANSFER' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Landmark className="w-5 h-5" />
                          </div>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'BANK_TRANSFER' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                          }`}>
                            {paymentMethod === 'BANK_TRANSFER' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Bank Transfer</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Company Account & Upload Slip
                          </p>
                        </div>
                      </button>

                      {/* Cash on Delivery / Pay on Pickup Tab */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                          paymentMethod === 'CASH'
                            ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            paymentMethod === 'CASH' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Banknote className="w-5 h-5" />
                          </div>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'CASH' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                          }`}>
                            {paymentMethod === 'CASH' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Cash on Pickup</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Pay in cash at pickup branch counter
                          </p>
                        </div>
                      </button>

                      {/* Card Payment Tab */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CREDIT_CARD')}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                          paymentMethod === 'CREDIT_CARD'
                            ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            paymentMethod === 'CREDIT_CARD' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'CREDIT_CARD' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                          }`}>
                            {paymentMethod === 'CREDIT_CARD' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Debit / Credit Card</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Instant Visa / MasterCard checkout
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* METHOD 1: BANK TRANSFER DETAILS & SLIP UPLOAD */}
                    {paymentMethod === 'BANK_TRANSFER' && (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        {/* Owner Bank Account Card */}
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-sky-400" />
                              <span className="font-extrabold text-sm tracking-wide">Owner / Official Bank Account Details</span>
                            </div>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified Business Account
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Bank Name</span>
                              <span className="font-bold text-white text-sm">Meezan Bank Limited</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Account Title</span>
                              <span className="font-bold text-white text-sm">DriveElite Car Rentals (Pvt) Ltd</span>
                            </div>

                            {/* Account Number */}
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Account Number</span>
                                <span className="font-mono font-bold text-white text-sm">0102-0103482910</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy('01020103482910', 'Account Number')}
                                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === 'Account Number' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedKey === 'Account Number' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>

                            {/* IBAN */}
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">IBAN (Raast / Interbank)</span>
                                <span className="font-mono font-bold text-white text-xs sm:text-sm">PK36MEZN0001020103482910</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy('PK36MEZN0001020103482910', 'IBAN')}
                                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === 'IBAN' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedKey === 'IBAN' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 text-[11px] text-slate-300 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span>Branch: Blue Area Branch, Islamabad (Branch Code: 0102)</span>
                            <span className="text-sky-300 font-bold">Transfer Exact Amount: {formatPKR(finalGrandTotal)}</span>
                          </div>
                        </div>

                        {/* Paid Slip Upload Box */}
                        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <UploadCloud className="w-4 h-4 text-sky-600" />
                              Upload Paid Transfer Slip / Receipt
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Attach a screenshot or photo of your online transfer confirmation, ATM receipt, or bank counter deposit slip.
                            </p>
                          </div>

                          {!slipFile ? (
                            <label className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-slate-50/50 hover:bg-sky-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
                              <div className="w-12 h-12 rounded-full bg-sky-50 group-hover:bg-sky-100 text-sky-600 flex items-center justify-center mb-2 transition-colors">
                                <UploadCloud className="w-6 h-6" />
                              </div>
                              <p className="text-xs font-bold text-slate-800">
                                Click or drag to upload paid transfer slip
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Supports PNG, JPG, JPEG, or PDF (Max 10MB)
                              </p>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleSlipChange}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {slipPreview ? (
                                  <img
                                    src={slipPreview}
                                    alt="Payment Slip Preview"
                                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                                    <FileText className="w-7 h-7" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{slipFile.name}</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {(slipFile.size / 1024).toFixed(1)} KB &bull; <span className="text-emerald-600 font-bold">Ready to submit</span>
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={removeSlip}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                                title="Remove Slip"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Optional Transaction Reference fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Transaction Reference / ID <span className="text-slate-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. MZN-94829104 or Raast Ref"
                                value={bankTxnId}
                                onChange={(e) => setBankTxnId(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Sender Account / Depositor Name <span className="text-slate-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Muhammad Ali"
                                value={bankSenderName}
                                onChange={(e) => setBankSenderName(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* METHOD 2: CASH ON DELIVERY / PAY ON PICKUP */}
                    {paymentMethod === 'CASH' && (
                      <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-3xl space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                            <Banknote className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-emerald-950 text-sm">Pay In Cash at Pickup Counter</h4>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              Zero online advance required. Pay in cash directly at our branch counter upon vehicle collection.
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-white/80 rounded-2xl border border-emerald-100 space-y-2.5 text-xs text-slate-700">
                          <div className="flex justify-between pb-2 border-b border-slate-100 font-semibold">
                            <span>Total Cash Payable at Counter:</span>
                            <span className="font-black text-emerald-700 text-sm">{formatPKR(finalGrandTotal)}</span>
                          </div>
                          <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc pl-4 leading-relaxed">
                            <li>Please bring the exact rental payment + security deposit in cash at time of vehicle pickup.</li>
                            <li>Original valid CNIC (or Passport) and original Driving License are required for verification.</li>
                            <li>A thorough pre-inspection checklist will be conducted with you before vehicle release.</li>
                            <li>Clicking continue will immediately generate your rental contract for digital signing.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* METHOD 3: CREDIT / DEBIT CARD */}
                    {paymentMethod === 'CREDIT_CARD' && (
                      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-bold text-slate-900 text-sm">Credit or Debit Card Payment</h4>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded">Visa</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded">MasterCard</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded">UnionPay</span>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Cardholder Full Name</label>
                            <input
                              type="text"
                              placeholder="Name as printed on card"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Card Number</label>
                            <input
                              type="text"
                              placeholder="4242 •••• •••• 4242"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                              <input
                                type="text"
                                placeholder="MM / YY"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">CVC / Security Code</label>
                              <input
                                type="password"
                                placeholder="•••"
                                maxLength={4}
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Review
                  </button>

                  {createdContract ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      Continue to E-Contract Signing <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={submitting || !createdBooking}
                      className={`px-6 py-3.5 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all active:scale-95 ${
                        paymentMethod === 'BANK_TRANSFER'
                          ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/30'
                          : paymentMethod === 'CASH'
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                      }`}
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing & Generating Contract...</span>
                        </div>
                      ) : (
                        <>
                          {paymentMethod === 'BANK_TRANSFER' && <UploadCloud className="w-4 h-4" />}
                          {paymentMethod === 'CASH' && <Banknote className="w-4 h-4" />}
                          {paymentMethod === 'CREDIT_CARD' && <CreditCard className="w-4 h-4" />}
                          <span>
                            {paymentMethod === 'BANK_TRANSFER'
                              ? 'Submit Transfer Slip & Move Towards Next Step'
                              : paymentMethod === 'CASH'
                              ? 'Confirm Cash on Pickup & Move Towards Next Step'
                              : `Pay ${formatPKR(finalGrandTotal)} & Move Towards Next Step`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: DIGITAL E-CONTRACT SIGNING */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 6: Digital E-Signature</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Sign your rental agreement paperlessly. Cryptographic evidence will be attached to your signature.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Payment
                  </button>
                </div>

                {createdContract ? (
                  <SignaturePad
                    onSave={handleSignContract}
                    disabled={submitting}
                  />
                ) : (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-3">
                    <p className="font-bold">Rental contract not generated yet.</p>
                    <p>Please complete Step 5 (Payment) to generate your official rental contract for signing.</p>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      Go to Step 5: Payment &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 7: CONFIRMATION */}
            {currentStep === 7 && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Booking Fully Confirmed!</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your reservation is completed, paid, and e-signed. Please bring your original CNIC and license when picking up the vehicle.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Link
                    to="/customer/bookings"
                    className="px-6 py-3 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    View My Bookings
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Price Itemization Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Booking Summary</h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Vehicle Daily Rate ({rentalDays} Days)</span>
                <span className="font-semibold text-slate-900">{formatPKR(rentalTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Addon Services ({selectedServices.length})</span>
                <span className="font-semibold text-slate-900">{formatPKR(servicesTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit (Refundable)</span>
                <span className="font-semibold text-slate-900">{formatPKR(securityDeposit)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900">
                <span>Grand Total (PKR)</span>
                <span className="text-xl font-black text-sky-600">{formatPKR(finalGrandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Selection Modal */}
      {showCarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-sky-600" />
                  Select Vehicle from Fleet
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose a vehicle for your dates. Your selected dates, locations, and options will be preserved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCarModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by make, model, category, or transmission..."
                  value={carSearchTerm}
                  onChange={(e) => setCarSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  autoFocus
                />
                {carSearchTerm && (
                  <button
                    onClick={() => setCarSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Fleet List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {filteredCars.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Car className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">No vehicles match your search.</p>
                </div>
              ) : (
                filteredCars.map((c) => {
                  const isCurrent = car?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCurrent
                          ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={getCarImageUrl(c)}
                          alt={`${c.make} ${c.model}`}
                          className="w-20 h-16 sm:w-24 sm:h-18 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-100"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {c.make} {c.model}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                              {c.year}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {c.category?.name || 'Standard'} &bull; {c.transmission || 'Automatic'} &bull; {c.seats || 5} Seats
                          </p>
                          <p className="text-xs font-bold text-sky-600 mt-1">
                            {formatPKR(c.dailyRate)} <span className="text-[10px] text-slate-400 font-normal">/ day</span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        {isCurrent ? (
                          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-200">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectVehicle(c)}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
                          >
                            Select Vehicle
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {filteredCars.length} vehicle{filteredCars.length === 1 ? '' : 's'} available
              </span>
              <button
                type="button"
                onClick={() => setShowCarModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

