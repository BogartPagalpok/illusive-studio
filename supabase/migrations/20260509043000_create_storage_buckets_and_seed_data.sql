/*
  # Create Storage Buckets and Seed Default Data

  1. Storage Buckets
    - `scroll-frames` (public) — for scroll sequence animation frames
    - `portfolio-media` (public) — for portfolio project images

  2. Seed Data
    - Insert default site_content entries for hero, services, about, contact sections
    - Insert default portfolio_projects with the 4 showcase projects

  3. Security
    - Both buckets are public (readable without authentication)
    - Only authenticated users can upload (handled by storage policies)
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('scroll-frames', 'scroll-frames', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('media', 'media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for scroll-frames bucket
CREATE POLICY "Public can view scroll frames"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'scroll-frames');

CREATE POLICY "Authenticated can upload scroll frames"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'scroll-frames');

CREATE POLICY "Authenticated can delete scroll frames"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'scroll-frames');

-- Storage policies for media bucket
CREATE POLICY "Public can view portfolio media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated can upload portfolio media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated can delete portfolio media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

-- Seed site_content
INSERT INTO site_content (section, key, value) VALUES
  ('hero', 'subtitle', 'Graphic Designer • Photographer • Virtual Assistant'),
  ('hero', 'heading_line1', 'Crafting Visual'),
  ('hero', 'heading_line2', 'Stories'),
  ('hero', 'heading_line3', 'Resonate'),
  ('hero', 'description', 'I''m Ian Lester Eclevia — where timeless design meets modern execution. From brand identity to digital painting, I bring ideas to life with precision and passion.'),
  ('services', 'subtitle', 'What I Do'),
  ('services', 'heading', 'Services & Expertise'),
  ('about', 'subtitle', 'Who I Am'),
  ('about', 'heading', 'About & Skills'),
  ('about', 'subheading', 'Creative mind. Reliable hands.'),
  ('about', 'description_line1', 'I''m Ian Lester Eclevia — a graphic designer, photographer, and virtual assistant who believes that great design is where timeless elegance meets modern trends.'),
  ('about', 'description_line2', 'With deep proficiency in Photoshop, digital painting, and photography, I craft visual stories that don''t just look beautiful — they communicate, connect, and convert.'),
  ('about', 'description_line3', 'Beyond design, I bring the same dedication to virtual assistance — organized, proactive, and committed to making your operations run seamlessly.'),
  ('contact', 'subtitle', 'Let''s Connect'),
  ('contact', 'heading', 'Get in Touch'),
  ('contact', 'description', 'Have a project in mind or need a creative partner? I''d love to hear from you.'),
  ('works', 'subtitle', 'Portfolio'),
  ('works', 'heading', 'Selected Works'),
  ('works', 'description', 'Quality over quantity — each project represents a deep commitment to craft, strategy, and visual storytelling.')
ON CONFLICT DO NOTHING;

-- Seed portfolio_projects
INSERT INTO portfolio_projects (title, category, description, process, tools, results, image_url, featured) VALUES
  (
    'Aurora Brand System',
    'Brand Identity',
    'A complete visual identity for a sustainable fashion startup, from logo to packaging design.',
    'Research-driven approach starting with competitive analysis, mood boarding, and iterative sketching before finalizing the mark and building the full system.',
    ARRAY['Photoshop', 'Illustrator', 'Canva'],
    'Client saw a 40% increase in brand recognition within 3 months of launch.',
    'https://images.pexels.com/photos/6444/desk-notebook-pen-note.jpg?auto=compress&cs=tinysrgb&w=800',
    true
  ),
  (
    'Solstice Portrait Series',
    'Photography',
    'A curated portrait series capturing the golden hour essence across diverse subjects.',
    'Location scouting, natural light optimization, and post-processing in Lightroom with custom presets for cohesive tonal grading.',
    ARRAY['Adobe Lightroom', 'Camera'],
    'Featured in two online photography showcases and drove 200+ inquiries.',
    'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  ),
  (
    'Mythos Digital Collection',
    'Digital Painting',
    'A series of mythological reinterpretations blending classical techniques with digital artistry.',
    'Initial pencil sketches digitized and painted in Photoshop using custom brushes, with layered textures for depth and atmosphere.',
    ARRAY['Photoshop', 'Wacom Tablet'],
    'Garnered 15K+ views on art platforms and three commission requests.',
    'https://images.pexels.com/photos/326514/pexels-photo-326514.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  ),
  (
    'Vertex Event Branding',
    'Graphic Design',
    'Full event branding package for a tech conference including posters, badges, and digital assets.',
    'Collaborative ideation with the events team, rapid prototyping of key visuals, and systematic rollout across all touchpoints.',
    ARRAY['Photoshop', 'Canva', 'Illustrator'],
    'Event attendance increased 25% year-over-year with the refreshed visual identity.',
    'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800',
    true
  )
ON CONFLICT DO NOTHING;
