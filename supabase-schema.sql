-- ===================================================
-- CampusPool Supabase Database Schema
-- Run this script in your Supabase SQL Editor
-- ===================================================

-- 1. Profiles / Users Table
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Rides Table
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
  total_capacity INT NOT NULL DEFAULT 4,
  seats_offered INT NOT NULL DEFAULT 3,
  seats_remaining INT NOT NULL DEFAULT 3,
  pricing_type TEXT CHECK (pricing_type IN ('fixed', 'shared')) DEFAULT 'fixed',
  price_per_seat NUMERIC NOT NULL DEFAULT 0,
  total_trip_cost NUMERIC,
  gender_preference TEXT CHECK (gender_preference IN ('everyone', 'women_only', 'men_only')) DEFAULT 'everyone',
  luggage_allowance TEXT CHECK (luggage_allowance IN ('none', 'small', 'medium', 'large')) DEFAULT 'medium',
  ac_available BOOLEAN DEFAULT TRUE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status TEXT CHECK (status IN ('open', 'full', 'cancelled', 'completed')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seats_booked INT NOT NULL DEFAULT 1,
  total_contribution NUMERIC NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('confirmed', 'cancelled', 'completed')) DEFAULT 'confirmed',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Messages & Conversations
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

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Safety Reports Table
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Open rides are viewable by everyone" ON public.rides FOR SELECT USING (true);
CREATE POLICY "Bookings viewable by ride participants" ON public.bookings FOR SELECT USING (true);
