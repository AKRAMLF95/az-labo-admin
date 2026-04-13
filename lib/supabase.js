import { createClient } from '@supabase/supabase-js'

// Fallbacks vides pour éviter le crash pendant le build Next.js.
// Les vraies valeurs sont injectées à runtime (navigateur / Vercel).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
