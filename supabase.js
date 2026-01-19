import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vfikxuftsgozbqiemmut.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaWt4dWZ0c2dvemJxaWVtbXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTkwNzYsImV4cCI6MjA4MTE5NTA3Nn0.FcTt9PAko5rQ62Va5EDDZCTA3jEkbpomOQBrAIVH9AQ';

// Service role key for admin operations
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaWt4dWZ0c2dvemJxaWVtbXV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTYxOTA3NiwiZXhwIjoyMDgxMTk1MDc2fQ.cK8uA-D4EjQ4srxPEU3Y8WSq-NHvudTDmOpnyyiVGy8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);