import React from 'react';
import { createClient } from '@/lib/supabase/server';
import SchoolSettingsClient from '@/components/admin/SchoolSettingsClient';

export default async function JadwalAdminPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('school_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  return <SchoolSettingsClient initialSettings={settings} />;
}
