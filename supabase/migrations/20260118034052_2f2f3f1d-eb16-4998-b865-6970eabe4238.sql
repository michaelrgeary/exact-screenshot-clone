-- Add remaining columns to projects table
ALTER TABLE public.projects ADD COLUMN source_file_path TEXT;
ALTER TABLE public.projects ADD COLUMN output_languages TEXT[] DEFAULT ARRAY['english', 'spanish'];
ALTER TABLE public.projects ADD COLUMN output_formats TEXT[] DEFAULT ARRAY['kindle', 'pdf_print', 'pdf_screen'];

-- Create storage bucket for source books (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('source-books', 'source-books', false);

-- Storage policies for authenticated users to manage their own files
CREATE POLICY "Users can upload source books"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'source-books' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own source books"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'source-books' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own source books"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'source-books' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );