import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { rideService } from '../services';
import { GenderBadge } from '../components/rides/GenderBadge';
import { formatINR, calculateSharedPerSeat } from '../utils/costEngine';
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Coins,
  Shield,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const CreateRidePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [origin, setOrigin] = useState<string>('Bhopal (MP Nagar Zone 2)');
  const [destination, setDestination] = useState<string>('VIT Bhopal Campus');
  const [intermediateStops, setIntermediateStops] = useState<string[]>(['ISBT Bhopal']);
  const [stopInput, setStopInput] = useState<string>('');

  const [departureDate, setDepartureDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [departureTime, setDepartureTime] = useState<string>('08:00');
  const [estimatedDuration, setEstimatedDuration] = useState<string>('1h 20m (65 km)');

  const [vehicleType, setVehicleType] = useState<string>('Sedan');
  const [vehicleModel, setVehicleModel] = useState<string>(currentUser?.vehicle?.model || 'Honda City');
  const [totalCapacity, setTotalCapacity] = useState<number>(4);
  const [seatsOffered, setSeatsOffered] = useState<number>(3);

  const [pricingType, setPricingType] = useState<'fixed' | 'shared'>('fixed');
  const [pricePerSeat, setPricePerSeat] = useState<number>(220);
  const [totalTripCost, setTotalTripCost] = useState<number>(880);
  const [contributingPassengersCount, setContributingPassengersCount] = useState<number>(4);

  const [genderPreference, setGenderPreference] = useState<'everyone' | 'women_only'>('everyone');
  const [luggageAllowance, setLuggageAllowance] = useState<'none' | 'small' | 'medium' | 'large'>('medium');
  const [acAvailable, setAcAvailable] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('Leaving on time. Safe commuting with fellow VIT students.');

  // Intermediate Stop Handlers
  const addStop = () => {
    if (stopInput.trim()) {
      setIntermediateStops([...intermediateStops, stopInput.trim()]);
      setStopInput('');
    }
  };

  const removeStop = (index: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  // Pricing calculation helper
  const calculatedSharedSeatPrice = calculateSharedPerSeat(totalTripCost, contributingPassengersCount);
  const effectivePricePerSeat = pricingType === 'fixed' ? pricePerSeat : calculatedSharedSeatPrice;

  // Validation
  const validateStep = (): boolean => {
    if (step === 1) {
      if (!origin.trim() || !destination.trim()) {
        showToast('Please specify both starting location and destination.', 'error');
        return false;
      }
      if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
        showToast('Starting location and destination cannot be identical.', 'error');
        return false;
      }
    }
    if (step === 2) {
      if (!departureDate || !departureTime) {
        showToast('Please select valid departure date and time.', 'error');
        return false;
      }
    }
    if (step === 3) {
      if (seatsOffered < 1) {
        showToast('You must offer at least 1 passenger seat.', 'error');
        return false;
      }
      if (seatsOffered >= totalCapacity) {
        showToast('Offered seats must leave room for the student creator.', 'error');
        return false;
      }
    }
    if (step === 4) {
      if (pricingType === 'fixed' && (pricePerSeat < 10 || pricePerSeat > 1000)) {
        showToast('Please enter a reasonable cost contribution (₹10 – ₹1000).', 'error');
        return false;
      }
      if (pricingType === 'shared' && totalTripCost < 50) {
        showToast('Please enter a valid estimated trip cost.', 'error');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublish = async () => {
    if (!currentUser) {
      showToast('Please log in to publish a ride.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRide = await rideService.createRide({
        creatorId: currentUser.id,
        origin: origin.trim(),
        destination: destination.trim(),
        intermediateStops,
        departureDate,
        departureTime,
        estimatedDuration,
        vehicleType,
        vehicleModel,
        totalCapacity,
        seatsOffered,
        pricingType,
        pricePerSeat: effectivePricePerSeat,
        totalTripCost: pricingType === 'shared' ? totalTripCost : undefined,
        contributingPassengersCount: pricingType === 'shared' ? contributingPassengersCount : undefined,
        genderPreference,
        luggageAllowance,
        acAvailable,
        smokingAllowed: false,
        notes: notes.trim(),
      });

      showToast('Your carpool ride has been published successfully!', 'success');
      navigate(`/rides/${newRide.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to publish ride', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Wizard Header & Progress */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold text-[#0071E3] uppercase tracking-wider">
              Step {step} of 6
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
              {step === 1 && 'Where are you travelling?'}
              {step === 2 && 'When do you depart?'}
              {step === 3 && 'Vehicle & Available Seats'}
              {step === 4 && 'Trip Cost & Contribution'}
              {step === 5 && 'Ride Preferences & Rules'}
              {step === 6 && 'Review and Publish'}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-sm shrink-0">
            {step}/6
          </div>
        </div>

        {/* Minimal Apple Progress Bar */}
        <div className="w-full bg-[#F5F5F7] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0071E3] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Step Content */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 sm:p-7 shadow-sm">
        {/* Step 1: Route */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Starting Location (Pickup)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#A1A1A6] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Bhopal (MP Nagar Zone 2)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Destination (Drop-off)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#0071E3] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. VIT Bhopal Campus"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            {/* Intermediate Stops */}
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Intermediate Pickup Points <span className="font-normal text-[#6E6E73]">(Optional)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={stopInput}
                  onChange={(e) => setStopInput(e.target.value)}
                  placeholder="Add a stop along the way (e.g. Sehore Crescent)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStop())}
                />
                <button
                  type="button"
                  onClick={addStop}
                  className="px-3.5 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold transition"
                >
                  Add Stop
                </button>
              </div>

              {intermediateStops.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {intermediateStops.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#D2D2D7] text-xs text-[#1D1D1F]"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => removeStop(idx)}
                        className="text-[#6E6E73] hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Departure Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#0071E3] absolute left-3.5 top-3" />
                <input
                  type="date"
                  value={departureDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Departure Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#0071E3] absolute left-3.5 top-3" />
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Estimated Duration / Distance
              </label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 1h 20m (65 km)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Vehicle & Seats */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Vehicle Category
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] bg-white text-xs sm:text-sm text-[#1D1D1F]"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="SUV">SUV</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Model / Colour
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Honda City White"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Total Vehicle Capacity
                </label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Seats Offered to Students
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalCapacity - 1}
                  value={seatsOffered}
                  onChange={(e) => setSeatsOffered(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F]"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#86868B]">
              * The student creator occupies 1 seat. Offering {seatsOffered} seats for fellow passengers.
            </p>
          </div>
        )}

        {/* Step 4: Cost */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-2">
                Choose Pricing Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPricingType('fixed')}
                  className={`p-4 rounded-2xl border text-left transition ${
                    pricingType === 'fixed'
                      ? 'border-[#0071E3] bg-[#0071E3]/5 ring-1 ring-[#0071E3]'
                      : 'border-[#D2D2D7] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm text-[#1D1D1F]">
                    Option A: Fixed Contribution
                  </p>
                  <p className="text-[11px] text-[#6E6E73] mt-1">
                    Set a constant amount per passenger seat (e.g. ₹220/seat). Amount stays fixed regardless of seat count.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingType('shared')}
                  className={`p-4 rounded-2xl border text-left transition ${
                    pricingType === 'shared'
                      ? 'border-[#0071E3] bg-[#0071E3]/5 ring-1 ring-[#0071E3]'
                      : 'border-[#D2D2D7] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm text-[#1D1D1F]">
                    Option B: Shared Trip Cost
                  </p>
                  <p className="text-[11px] text-[#6E6E73] mt-1">
                    Enter estimated total trip cost (fuel + toll) divided equally among all travelling students.
                  </p>
                </button>
              </div>
            </div>

            {pricingType === 'fixed' ? (
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Contribution per Passenger Seat (₹)
                </label>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  step={10}
                  value={pricePerSeat}
                  onChange={(e) => setPricePerSeat(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F]"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                      Estimated Trip Cost (₹)
                    </label>
                    <input
                      type="number"
                      min={50}
                      step={20}
                      value={totalTripCost}
                      onChange={(e) => setTotalTripCost(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                      Total Travelling Students
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={8}
                      value={contributingPassengersCount}
                      onChange={(e) => setContributingPassengersCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs sm:text-sm text-[#1D1D1F]"
                    />
                  </div>
                </div>
                <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs text-[#6E6E73]">
                  Calculation: {formatINR(totalTripCost)} ÷ {contributingPassengersCount} people ={' '}
                  <strong className="text-[#0071E3] font-bold">
                    {formatINR(calculatedSharedSeatPrice)} per person
                  </strong>
                </div>
              </div>
            )}

            {/* Live Cost Preview */}
            <div className="p-4 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#6E6E73] uppercase">
                  Passenger Display Price
                </span>
                <p className="text-xl font-bold text-[#1D1D1F]">
                  {formatINR(effectivePricePerSeat)}
                  <span className="text-xs font-normal text-[#6E6E73] ml-1">/ seat</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#6E6E73] block">
                  Potential Contribution ({seatsOffered} seats)
                </span>
                <span className="font-bold text-[#0071E3] text-sm">
                  Up to {formatINR(effectivePricePerSeat * seatsOffered)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Gender Preference & Rules */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-2">
                Ride Eligibility Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGenderPreference('everyone')}
                  className={`p-4 rounded-2xl border text-left transition ${
                    genderPreference === 'everyone'
                      ? 'border-[#0071E3] bg-[#0071E3]/5 ring-1 ring-[#0071E3]'
                      : 'border-[#D2D2D7] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm text-[#1D1D1F]">Everyone Welcome</p>
                  <p className="text-[11px] text-[#6E6E73] mt-1">
                    Open to any verified student of VIT Bhopal regardless of gender.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setGenderPreference('women_only')}
                  className={`p-4 rounded-2xl border text-left transition ${
                    genderPreference === 'women_only'
                      ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500'
                      : 'border-[#D2D2D7] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-rose-600" />
                    <p className="font-bold text-xs sm:text-sm text-rose-700">Women-Only Ride</p>
                  </div>
                  <p className="text-[11px] text-[#6E6E73] mt-1">
                    Only female students can book seats. Automatic eligibility is enforced during instant booking.
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Luggage Allowance
                </label>
                <select
                  value={luggageAllowance}
                  onChange={(e) => setLuggageAllowance(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] bg-white text-xs sm:text-sm text-[#1D1D1F]"
                >
                  <option value="none">No Luggage</option>
                  <option value="small">Small (Backpack)</option>
                  <option value="medium">Medium (Cabin Bag)</option>
                  <option value="large">Large (Suitcase)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Air Conditioning
                </label>
                <button
                  type="button"
                  onClick={() => setAcAvailable(!acAvailable)}
                  className={`w-full py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                    acAvailable
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-[#6E6E73] border-[#D2D2D7]'
                  }`}
                >
                  {acAvailable ? 'AC Available ✓' : 'No AC'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Trip Notes / Co-passenger Guidelines
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific landmark pickup point, timing, luggage space..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F]"
              />
            </div>
          </div>
        )}

        {/* Step 6: Review and Publish */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]/60 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#D2D2D7]/50 font-bold text-sm text-[#1D1D1F]">
                <span>Journey Preview</span>
                <span className="text-[#0071E3]">{formatINR(effectivePricePerSeat)} / seat</span>
              </div>

              <div>
                <span className="text-[#6E6E73] block text-[11px]">Route</span>
                <p className="font-semibold text-xs text-[#1D1D1F]">
                  {origin} → {destination}
                </p>
                {intermediateStops.length > 0 && (
                  <p className="text-[11px] text-[#6E6E73]">Via: {intermediateStops.join(', ')}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#6E6E73] block">Date & Time</span>
                  <span className="font-medium text-[#1D1D1F]">
                    {departureDate} at {departureTime}
                  </span>
                </div>
                <div>
                  <span className="text-[#6E6E73] block">Seats Available</span>
                  <span className="font-medium text-[#1D1D1F]">{seatsOffered} Passenger Seats</span>
                </div>
                <div>
                  <span className="text-[#6E6E73] block">Vehicle</span>
                  <span className="font-medium text-[#1D1D1F]">
                    {vehicleModel} ({vehicleType})
                  </span>
                </div>
                <div>
                  <span className="text-[#6E6E73] block">Preference</span>
                  <span className="font-medium text-[#1D1D1F] capitalize">
                    {genderPreference.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                Your ride will appear instantly in search results. Eligible students will be able to book seats with automatic confirmation.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-4 border-t border-[#F5F5F7] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-[#D2D2D7] text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublish}
              className="px-6 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-[#0071E3]/25 active:scale-95 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Ride'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
