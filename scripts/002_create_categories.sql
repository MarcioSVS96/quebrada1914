-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies - only authenticated users can manage categories
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_auth" ON public.categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "categories_update_auth" ON public.categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_delete_auth" ON public.categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert default categories
INSERT INTO public.categories (name, display_name, icon) VALUES
  ('camisetas', 'Camisetas', '👕'),
  ('moletons', 'Moletons', '🧥'),
  ('bones', 'Bonés', '🧢'),
  ('acessorios', 'Acessórios', '🔗')
ON CONFLICT (name) DO NOTHING;
