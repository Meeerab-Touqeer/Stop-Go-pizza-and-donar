import { initLocalStore, localStore } from './localStore.js';

let active = localStore;

export async function initStore() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { initSupabase, supabaseStore } = await import('./supabaseStore.js');
    await initSupabase();
    active = supabaseStore;
    console.log('STOP&GO data source: Supabase');
    return;
  }
  await initLocalStore();
  active = localStore;
  console.log('STOP&GO data source: local menu file');
}

export function getStore() {
  return active;
}
