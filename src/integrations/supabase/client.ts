// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uprgthfiinpmncedfsrb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcmd0aGZpaW5wbW5jZWRmc3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMzM0NDEsImV4cCI6MjA1OTkwOTQ0MX0.xvPz2byvSZh88hQL52EOtVd_uBzGxec38w2i0D3ml6I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);