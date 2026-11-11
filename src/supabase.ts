// src/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Pega aquí tu Project URL (la encuentras en "Data API" en el menú izquierdo)
const supabaseUrl = 'https://zikwjtsgxxzwyrmxeozx.supabase.co'

// Pega aquí tu llave que empieza con sb_publishable_...
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppa3dqdHNneHh6d3lybXhlb3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNDc1ODEsImV4cCI6MjEwOTkyMzU4MX0._8v2UoMfS8D3pFQ5Ra7BUCwPqlCKzYM7NqRPaMYhpAs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)