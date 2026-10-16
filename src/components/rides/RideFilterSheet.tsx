import React from 'react';
import type { RideFilters } from '../../services';
import { X, Filter, RotateCcw, Search } from 'lucide-react';

interface RideFilterSheetProps {
  filters: RideFilters;
  onChange: (filters: RideFilters) => void;
  onReset: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeFilterCount: number;
}

export const RideFilterSheet: React.FC<RideFilterSheetProps> = ({
  filters,
  onChange,
  onReset,
  isOpenMobile,
  onCloseMobile,
  activeFilterCount,
}) => {
  const content = (
    <div className="space-y-5 text-xs text-[#1D1D1F]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F7]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0071E3]" />
          <h3 className="font-bold text-sm text-[#1D1D1F]">Filter Rides</h3>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#0071E3] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-[11px] font-medium text-[#0071E3] hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Origin */}
      <div>
        <label className="block font-semibold mb-1.5 text-[#1D1D1F]">From (Origin)</label>
        <input
          type="text"
          value={filters.origin || ''}
          onChange={(e) => onChange({ ...filters, origin: e.target.value })}
          placeholder="e.g. Bhopal, Lalghati, Sehore"
          className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7] focus:outline-none focus:border-[#0071E3]"
        />
      </div>

      {/* Destination */}
      <div>
        <label className="block font-semibold mb-1.5 text-[#1D1D1F]">To (Destination)</label>
        <input
          type="text"
          value={filters.destination || ''}
          onChange={(e) => onChange({ ...filters, destination: e.target.value })}
          placeholder="e.g. VIT Bhopal, Bhopal, Sehore"
          className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7] focus:outline-none focus:border-[#0071E3]"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block font-semibold mb-1.5 text-[#1D1D1F]">Travel Date</label>
        <input
          type="date"
          value={filters.date || ''}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7] focus:outline-none focus:border-[#0071E3]"
        />
      </div>

      {/* Gender Preference */}
      <div>
        <label className="block font-semibold mb-1.5 text-[#1D1D1F]">Ride Preference</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                genderPreference: filters.genderPreference === 'everyone' ? 'all' : 'everyone',
              })
            }
            className={`py-2 px-2.5 rounded-xl border text-center transition ${
              filters.genderPreference === 'everyone'
                ? 'bg-[#0071E3] text-white border-[#0071E3] font-semibold'
                : 'bg-white border-[#D2D2D7] text-[#1D1D1F]'
            }`}
          >
            Everyone
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                genderPreference: filters.genderPreference === 'women_only' ? 'all' : 'women_only',
              })
            }
            className={`py-2 px-2.5 rounded-xl border text-center transition ${
              filters.genderPreference === 'women_only'
                ? 'bg-rose-600 text-white border-rose-600 font-semibold'
                : 'bg-white border-[#D2D2D7] text-[#1D1D1F]'
            }`}
          >
            Women-Only
          </button>
        </div>
      </div>

      {/* Seats Available */}
      <div>
        <label className="block font-semibold mb-1.5 text-[#1D1D1F]">Minimum Available Seats</label>
        <div className="flex gap-2">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange({ ...filters, minSeats: filters.minSeats === num ? undefined : num })}
              className={`flex-1 py-1.5 rounded-xl border transition ${
                filters.minSeats === num
                  ? 'bg-[#0071E3] text-white border-[#0071E3] font-semibold'
                  : 'bg-white border-[#D2D2D7] text-[#1D1D1F]'
              }`}
            >
              {num}+
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="font-semibold text-[#1D1D1F]">Max Contribution</label>
          <span className="text-[#0071E3] font-bold">
            {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="800"
          step="50"
          value={filters.maxPrice || 800}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: Number(e.target.value) === 800 ? undefined : Number(e.target.value),
            })
          }
          className="w-full accent-[#0071E3] cursor-pointer"
        />
      </div>

      {/* Sorting */}
      <div>
        <label className="block font-semibold mb-1.5 text-[#1D1D1F]">Sort By</label>
        <select
          value={filters.sortBy || 'time_asc'}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full px-3 py-2 rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
        >
          <option value="time_asc">Departure Time (Earliest first)</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="seats_desc">Available Seats: High to Low</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block w-72 bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-5 shadow-sm self-start sticky top-20">
        {content}
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={onCloseMobile} />
          <div className="relative bg-[#FFFFFF] rounded-t-3xl border-t border-[#D2D2D7] w-full max-h-[85vh] overflow-y-auto p-5 pb-safe z-10 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-[#D2D2D7] rounded-full mx-auto mb-4" />
            {content}
            <div className="mt-5 pt-3 border-t border-[#F5F5F7] flex gap-2">
              <button
                onClick={onReset}
                className="flex-1 py-2.5 rounded-xl border border-[#D2D2D7] text-xs font-semibold text-[#1D1D1F]"
              >
                Reset All
              </button>
              <button
                onClick={onCloseMobile}
                className="flex-1 py-2.5 rounded-xl bg-[#0071E3] text-white text-xs font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
