import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://srhybtbhfhhcvhpqrlop.supabase.co';
const supabaseKey = 'sb_publishable_gMOE0SPYmcUseFixl2PYJQ_cPxYaZpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- Testing Supabase Connection & Generating Accounts ---');

  const accounts = [
    {
      email: 'admin@sekolah.sch.id',
      password: 'admin123',
      meta: {
        nama: 'Administrator Sekolah',
        full_name: 'Administrator Sekolah',
        role: 'ADMIN',
        jabatan: 'Kepala Tata Usaha',
      },
    },
    {
      email: 'guru@sekolah.sch.id',
      password: 'guru123',
      meta: {
        nama: 'Budi Santoso, S.Pd.',
        full_name: 'Budi Santoso, S.Pd.',
        nip: '198501012010011001',
        role: 'GURU',
        jabatan: 'Guru Matematika',
      },
    },
    {
      email: 'siti@sekolah.sch.id',
      password: 'guru123',
      meta: {
        nama: 'Siti Aminah, M.Pd.',
        full_name: 'Siti Aminah, M.Pd.',
        nip: '198904122014032002',
        role: 'GURU',
        jabatan: 'Guru Bahasa Indonesia',
      },
    },
  ];

  for (const acc of accounts) {
    console.log(`\nRegistering / Checking: ${acc.email} (${acc.meta.role})...`);
    const { data, error } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
      options: {
        data: acc.meta,
      },
    });

    if (error) {
      console.log(`Error signing up ${acc.email}:`, error.message);
    } else {
      console.log(`Success! User ID: ${data.user?.id}`);
      if (data.session) {
        console.log('Session created immediately (Email confirm is OFF or auto-confirmed)');
      } else {
        console.log('Confirmation email might be required if email confirmations are enabled.');
      }
    }
  }
}

main().catch(console.error);
