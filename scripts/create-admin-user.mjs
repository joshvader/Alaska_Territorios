// Script único para crear el usuario administrador inicial en Supabase Auth.
// Ejecutar UNA vez con: node scripts/create-admin-user.mjs
// Después de ejecutarlo correctamente, este archivo puede eliminarse.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Carga manual de .env (en la raíz del proyecto)
function loadEnv(filePath) {
  try {
    const text = readFileSync(filePath, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (err) {
    console.error(`No se pudo leer ${filePath}:`, err.message);
  }
}

loadEnv(resolve(process.cwd(), '.env'));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = 'admin@territorios.com';
// Supabase Auth exige mínimo 6 caracteres por defecto.
const password = 'admin123';
const userMeta = { full_name: 'Administrador' };

async function main() {
  // Comprobar si ya existe
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listErr) {
    console.error('Error listando usuarios:', listErr.message);
    process.exit(1);
  }
  const existing = list.users.find((u) => u.email === email);

  if (existing) {
    console.log(`El usuario ${email} ya existe (id=${existing.id}). Actualizando contraseña...`);
    const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: userMeta,
    });
    if (updErr) {
      console.error('Error actualizando contraseña:', updErr.message);
      process.exit(1);
    }
    console.log('Contraseña actualizada correctamente.');
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userMeta,
  });

  if (error) {
    console.error('Error creando usuario:', error.message);
    process.exit(1);
  }

  console.log(`Usuario creado correctamente: ${data.user.id} (${data.user.email})`);
}

main();
