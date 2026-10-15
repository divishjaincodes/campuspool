import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { rideService } from '../services';
import { RideFilters } from '../services/mock/rideService';
import { Ride } from '../types';
import { RideCard } from '../components/rides/RideCard';
import { RideFilterSheet } from '../components/rides/RideFilterSheet';
import { InstantBookModal } from '../components/rides/InstantBookModal';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Filter, RotateCcw, Car } from 'lucide-react';

export const RidesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRideForBook, setSelectedRideForBook] = useState<Ride | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<RideFilters>({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
    genderPreference: (searchParams.get('genderPreference') as any) || 'all',
    minSeats: searchParams.get('minSeats') ? Number(searchParams.get('minSeats')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'time_asc',
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.origin) count++;
    if (filters.destination) count++;
    if (filters.date) count++;
    if (filters.genderPreference && filters.genderPreference !== 'all') count++;
    if (filters.minSeats) count++;
    if (filters.maxPrice) count++;
    return count;
  }, [filters]);

  const rides = useMemo(() => {
    return rideService.getAllRides(filters);
  }, [filters]);

  const handleResetFilters = () => {
    const emptyFilters: RideFilters = {
      origin: '',
      destination: '',
      date: '',
      genderPreference: 'all',
      minSeats: undefined,
      maxPrice: undefined,
      sortBy: 'time_asc',
    };
    setFilters(emptyFilters);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Header Bar */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/70 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
            Find Student Rides
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Showing {rides.length} available carpool journey{rides.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F]"
          >
            <Filter className="w-4 h-4 text-[#0071E3]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="p-2.5 rounded-xl border border-[#D2D2D7] text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Sidebar + Rides List */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Filter & Mobile Sheet */}
        <RideFilterSheet
          filters={filters}
          onChange={(newF) => setFilters(newF)}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
          activeFilterCount={activeFilterCount}
        />

        {/* Rides Grid */}
        <div className="flex-1">
          {rides.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No matching rides found"
              description="Try adjusting your route, changing the date, or clearing your active filters to see all student carpools."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onBookClick={(r) => setSelectedRideForBook(r)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instant Book Modal */}
      {selectedRideForBook && (
        <InstantBookModal
          ride={selectedRideForBook}
          onClose={() => setSelectedRideForBook(null)}
          onSuccess={() => {
            setSelectedRideForBook(null);
            // Re-trigger memo update
            setFilters({ ...filters });
          }}
        />
      )}
    </div>
  );
};
