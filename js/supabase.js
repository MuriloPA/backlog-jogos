// Importa o cliente do Supabase direto da CDN, sem instalar nada
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://pigmwuvmylxgxjiwpaoh.supabase.co";
const SUPABASE_KEY = "sb_publishable__BMu54V4r7R8yjEM2ZMcMQ_Q6tvKEEr";

// Cliente único, usado por todos os outros arquivos
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);