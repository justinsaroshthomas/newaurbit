-- Add Role to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('user', 'dev', 'ceo', 'staff')) DEFAULT 'user';

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'message', 'circle_add', 'broadcast'
  content text NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage notifications." ON public.notifications FOR ALL USING (true); -- Broad for prototype

-- Add high-res media storage bucket
INSERT INTO storage.buckets (id, name, public) 
SELECT 'chat-media', 'chat-media', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'chat-media');

-- RLS for the new bucket
CREATE POLICY "Public Access for chat-media" ON storage.objects FOR SELECT USING (bucket_id = 'chat-media');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');
