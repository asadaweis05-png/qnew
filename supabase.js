const SUPABASE_URL = 'https://lbxjsemcruizsxglfesw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieGpzZW1jcnVpenN4Z2xmZXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjA1NDgsImV4cCI6MjA4NzQzNjU0OH0.QsJ1vIrrNALskyX3Sp2wCmHeGBXcQSDDp5qZn0zZ1OA';

// Initialize the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
