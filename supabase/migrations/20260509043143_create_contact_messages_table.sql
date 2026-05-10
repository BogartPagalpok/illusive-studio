/*
  # Create Contact Messages Table

  1. New Table
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text) - sender name
      - `email` (text) - sender email
      - `message` (text) - message content
      - `read` (boolean) - whether admin has read the message
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Anyone can INSERT (for the contact form)
    - Only authenticated users can SELECT/DELETE (for admin panel)
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (true);
