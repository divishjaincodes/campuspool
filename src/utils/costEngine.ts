/**
 * CampusPool Cost Calculation Engine
 * Handles student cost-sharing math, Indian Rupee formatting,
 * and transparent estimation logic.
 */

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
};

export const calculateFixedContribution = (pricePerSeat: number, seats: number = 1): number => {
  if (pricePerSeat < 0 || seats < 1) return 0;
  return Math.round(pricePerSeat * seats);
};

/**
 * Option B: Total shared trip cost divided by number of contributing passengers.
 * @param totalTripCost Total fuel/toll cost of the ride (e.g. ₹1000)
 * @param contributingPassengersCount Number of passengers expected to split the cost (e.g. 4)
 * Returns the estimated cost per passenger seat (e.g. ₹250).
 */
export const calculateSharedPerSeat = (
  totalTripCost: number,
  contributingPassengersCount: number
): number => {
  if (!totalTripCost || totalTripCost <= 0 || !contributingPassengersCount || contributingPassengersCount <= 0) {
    return 0;
  }
  return Math.round(totalTripCost / contributingPassengersCount);
};

export const calculateExpectedTotalContribution = (
  pricingType: 'fixed' | 'shared',
  pricePerSeat: number,
  seatsBooked: number
): number => {
  return pricePerSeat * seatsBooked;
};

export const calculateRemainingSeats = (
  seatsOffered: number,
  totalSeatsBooked: number
): number => {
  return Math.max(0, seatsOffered - totalSeatsBooked);
};
