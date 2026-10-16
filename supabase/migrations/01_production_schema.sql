-- ====================================================================
-- CampusPool Production Database Migration
-- Includes: Constraints, Indexes, Automated User Trigger, Full RLS, and Atomic RPCs
-- ====================================================================

-- 1. BASE TABLES WITH CONSTRAINTS (Idempotent)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  college TEXT NOT NULL DEFAULT 'VIT Bhopal University',
  reg_number TEXT,
  gender TEXT CHECK (gender IN ('female', 'male', 'undisclosed')) DEFAULT 'undisclosed',
  phone TEXT,
  bio TEXT,
  vehicle JSONB,
  is_suspended BOOLEAN DEFAULT FALSE,
  verification_status TEXT CHECK (verification_status IN ('demo', 'pending', 'verified')) DEFAULT 'verified',
  role TEXT CHECK (role IN ('student', 'admin')) DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  intermediate_stops TEXT[] DEFAULT '{}',
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  estimated_duration TEXT,
  vehicle_type TEXT NOT NULL DEFAULT 'Car',
  vehicle_model TEXT,
  total_capacity INT NOT NULL DEFAULT 4 CHECK (total_capacity >= 1 AND total_capacity <= 8),
  seats_offered INT NOT NULL DEFAULT 3 CHECK (seats_offered >= 1 AND seats_offered <= 8),
  seats_remaining INT NOT NULL DEFAULT 3 CHECK (seats_remaining >= 0 AND seats_remaining <= seats_offered),
  pricing_type TEXT CHECK (pricing_type IN ('fixed', 'shared')) DEFAULT 'fixed',
  price_per_seat NUMERIC NOT NULL DEFAULT 0 CHECK (price_per_seat >= 0),
  total_trip_cost NUMERIC CHECK (total_trip_cost IS NULL OR total_trip_cost >= 0),
  contributing_passengers_count INT DEFAULT 4,
  gender_preference TEXT CHECK (gender_preference IN ('everyone', 'women_only', 'men_only')) DEFAULT 'everyone',
  luggage_allowance TEXT CHECK (luggage_allowance IN ('none', 'small', 'medium', 'large')) DEFAULT 'medium',
  ac_available BOOLEAN DEFAULT TRUE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status TEXT CHECK (status IN ('open', 'full', 'cancelled', 'completed')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seats_booked INT NOT NULL DEFAULT 1 CHECK (seats_booked >= 1),
  total_contribution NUMERIC NOT NULL DEFAULT 0 CHECK (total_contribution >= 0),
  status TEXT CHECK (status IN ('confirmed', 'cancelled', 'completed')) DEFAULT 'confirmed',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  participant_ids UUID[] NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES FOR HIGH-PERFORMANCE DISCOVERY QUERIES
CREATE INDEX IF NOT EXISTS idx_rides_status_dates ON public.rides (status, departure_date, departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_origin_dest ON public.rides (origin, destination);
CREATE INDEX IF NOT EXISTS idx_rides_creator ON public.rides (creator_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON public.bookings (passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride ON public.bookings (ride_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages (conversation_id);

-- Enforce at most 1 confirmed booking per passenger on any single ride
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_confirmed_booking 
  ON public.bookings (ride_id, passenger_id) 
  WHERE (status = 'confirmed');

-- 3. AUTOMATIC PROFILE TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, college, gender, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    'VIT Bhopal University',
    'undisclosed',
    'student'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Rides Policies
DROP POLICY IF EXISTS "Open rides are viewable by everyone" ON public.rides;
CREATE POLICY "Open rides are viewable by everyone" ON public.rides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated students can create rides" ON public.rides;
CREATE POLICY "Authenticated students can create rides" ON public.rides FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can update their rides" ON public.rides;
CREATE POLICY "Creators can update their rides" ON public.rides FOR UPDATE USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can delete their rides" ON public.rides;
CREATE POLICY "Creators can delete their rides" ON public.rides FOR DELETE USING (auth.uid() = creator_id);

-- Bookings Policies
DROP POLICY IF EXISTS "Bookings viewable by ride participants" ON public.bookings;
CREATE POLICY "Bookings viewable by ride participants" ON public.bookings FOR SELECT 
  USING (auth.uid() = passenger_id OR auth.uid() IN (SELECT creator_id FROM public.rides WHERE id = ride_id));

DROP POLICY IF EXISTS "Passengers can insert bookings" ON public.bookings;
CREATE POLICY "Passengers can insert bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);

DROP POLICY IF EXISTS "Participants can update bookings" ON public.bookings;
CREATE POLICY "Participants can update bookings" ON public.bookings FOR UPDATE 
  USING (auth.uid() = passenger_id OR auth.uid() IN (SELECT creator_id FROM public.rides WHERE id = ride_id));

-- Conversations & Messages Policies
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT 
  USING (auth.uid() = ANY(participant_ids));

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = ANY(participant_ids));

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)));

DROP POLICY IF EXISTS "Senders can insert messages" ON public.messages;
CREATE POLICY "Senders can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews Policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Reviewers can insert reviews" ON public.reviews;
CREATE POLICY "Reviewers can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Reports Policies
DROP POLICY IF EXISTS "Reporters can view their reports" ON public.reports;
CREATE POLICY "Reporters can view their reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Reporters can insert reports" ON public.reports;
CREATE POLICY "Reporters can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);


-- 5. ATOMIC DATABASE RPC: BOOK RIDE (Concurrency Safe with Row Locking)
CREATE OR REPLACE FUNCTION public.book_ride(
  p_ride_id UUID,
  p_seats_requested INT,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_ride RECORD;
  v_user RECORD;
  v_booking_id UUID;
  v_total_contribution NUMERIC;
BEGIN
  -- Authenticate caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to book a seat.';
  END IF;

  IF p_seats_requested < 1 THEN
    RAISE EXCEPTION 'You must request at least 1 seat.';
  END IF;

  -- Lock ride row for update to eliminate race conditions
  SELECT * INTO v_ride FROM public.rides WHERE id = p_ride_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found.';
  END IF;

  IF v_ride.status <> 'open' THEN
    RAISE EXCEPTION 'This ride is no longer open for booking (status: %).', v_ride.status;
  END IF;

  IF v_ride.creator_id = v_user_id THEN
    RAISE EXCEPTION 'You cannot book a seat on a ride you created.';
  END IF;

  IF v_ride.seats_remaining < p_seats_requested THEN
    RAISE EXCEPTION 'Only % seat(s) available.', v_ride.seats_remaining;
  END IF;

  -- Fetch passenger profile for gender check
  SELECT * INTO v_user FROM public.profiles WHERE id = v_user_id;
  IF v_ride.gender_preference = 'women_only' AND (v_user.gender IS NULL OR v_user.gender <> 'female') THEN
    RAISE EXCEPTION 'This ride is designated as Women-only. Booking is reserved for female students.';
  END IF;

  -- Check existing active booking
  IF EXISTS (SELECT 1 FROM public.bookings WHERE ride_id = p_ride_id AND passenger_id = v_user_id AND status = 'confirmed') THEN
    RAISE EXCEPTION 'You already have a confirmed seat on this ride.';
  END IF;

  -- Calculate contribution
  v_total_contribution := v_ride.price_per_seat * p_seats_requested;

  -- Insert booking
  INSERT INTO public.bookings (
    ride_id,
    passenger_id,
    seats_booked,
    total_contribution,
    status,
    message
  ) VALUES (
    p_ride_id,
    v_user_id,
    p_seats_requested,
    v_total_contribution,
    'confirmed',
    p_message
  ) RETURNING id INTO v_booking_id;

  -- Decrement seats atomically
  UPDATE public.rides
  SET 
    seats_remaining = seats_remaining - p_seats_requested,
    status = CASE WHEN (seats_remaining - p_seats_requested) = 0 THEN 'full' ELSE 'open' END,
    updated_at = NOW()
  WHERE id = p_ride_id;

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'ride_id', p_ride_id,
    'seats_booked', p_seats_requested,
    'total_contribution', v_total_contribution,
    'status', 'confirmed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. ATOMIC DATABASE RPC: CANCEL BOOKING
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_booking RECORD;
  v_ride RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found.';
  END IF;

  SELECT * INTO v_ride FROM public.rides WHERE id = v_booking.ride_id FOR UPDATE;

  -- Allow passenger or ride creator to cancel
  IF v_booking.passenger_id <> v_user_id AND v_ride.creator_id <> v_user_id THEN
    RAISE EXCEPTION 'Unauthorized to cancel this booking.';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Booking already cancelled.');
  END IF;

  -- Update booking status
  UPDATE public.bookings 
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_booking_id;

  -- Restore seat capacity
  UPDATE public.rides
  SET 
    seats_remaining = LEAST(total_capacity, seats_remaining + v_booking.seats_booked),
    status = CASE WHEN status = 'full' THEN 'open' ELSE status END,
    updated_at = NOW()
  WHERE id = v_booking.ride_id;

  RETURN jsonb_build_object('success', true, 'booking_id', p_booking_id, 'status', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. ATOMIC DATABASE RPC: CANCEL RIDE
CREATE OR REPLACE FUNCTION public.cancel_ride(
  p_ride_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_ride RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_ride FROM public.rides WHERE id = p_ride_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found.';
  END IF;

  IF v_ride.creator_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the creator can cancel this ride.';
  END IF;

  -- Cancel ride
  UPDATE public.rides
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_ride_id;

  -- Cancel all active bookings on this ride
  UPDATE public.bookings
  SET status = 'cancelled', updated_at = NOW()
  WHERE ride_id = p_ride_id AND status = 'confirmed';

  RETURN jsonb_build_object('success', true, 'ride_id', p_ride_id, 'status', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
