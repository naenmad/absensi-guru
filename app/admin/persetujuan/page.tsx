import React from 'react';
import { createClient } from '@/lib/supabase/server';
import LeaveApprovalClient from '@/components/admin/LeaveApprovalClient';

export default async function PersetujuanAdminPage() {
  const supabase = await createClient();

  const { data: leaves } = await supabase
    .from('leave_requests')
    .select('*, profiles(nama, nip, jabatan)')
    .order('created_at', { ascending: false });

  return <LeaveApprovalClient initialLeaves={leaves || []} />;
}
