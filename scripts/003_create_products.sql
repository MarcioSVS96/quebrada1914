-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category TEXT NOT NULL REFERENCES public.categories(name) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  image TEXT,
  stock INTEGER NOT NULL DEFAULT 999 CHECK (stock >= 0),
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies - public can read, only authenticated can manage
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_auth" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "products_update_auth" ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "products_delete_auth" ON public.products FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert default products
INSERT INTO public.products (name, price, category, description, stock, featured) VALUES
  ('Camiseta Torcida Organizada', 45.90, 'camisetas', 'Camiseta preta com estampa exclusiva da torcida. Algodão premium, conforto total para representar na arquibancada.', 999, true),
  ('Moletom Quebrada Style', 89.90, 'moletons', 'Moletom com capuz, estampa frontal e costas. Perfeito para os dias frios na arquibancada, com muito estilo.', 999, true),
  ('Boné Aba Reta Clássico', 35.90, 'bones', 'Boné aba reta com bordado exclusivo. Ajuste perfeito, estilo garantido para completar o visual.', 999, false),
  ('Chaveiro Torcida', 12.90, 'acessorios', 'Chaveiro em metal com logo da torcida. Resistente e com muito estilo para levar a quebrada sempre com você.', 999, false),
  ('Camiseta Vintage 1914', 49.90, 'camisetas', 'Edição especial com estampa retrô. Para quem conhece a história da quebrada e quer representar com autenticidade.', 999, true),
  ('Moletom Fechado Premium', 95.90, 'moletons', 'Moletom fechado com zíper, bolsos frontais. Qualidade premium para enfrentar o frio com estilo e conforto.', 999, false)
ON CONFLICT DO NOTHING;
