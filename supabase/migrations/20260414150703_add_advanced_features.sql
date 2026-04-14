-- Add Reputation and Verification to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_score integer DEFAULT 0;

-- Create Circles logic (Inner/Outer)
CREATE TABLE IF NOT EXISTS public.circles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  circle_type text CHECK (circle_type IN ('inner', 'outer')) DEFAULT 'outer',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(owner_id, member_id)
);

-- Enable RLS on circles
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own circles." ON public.circles FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = member_id);
CREATE POLICY "Users can manage their own circles." ON public.circles FOR ALL USING (auth.uid() = owner_id);

-- Ensure Reels table exists with proper structure
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reels') THEN
        CREATE TABLE public.reels (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
          video_url text NOT NULL,
          caption text,
          likes_count integer DEFAULT 0,
          comments_count integer DEFAULT 0,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Public reels are viewable by everyone." ON public.reels FOR SELECT USING (true);
        CREATE POLICY "Users can insert own reels." ON public.reels FOR INSERT WITH CHECK (auth.uid() = author_id);
    END IF;
END $$;

-- Storage buckets for reels
INSERT INTO storage.buckets (id, name, public) 
SELECT 'reels', 'reels', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'reels');
