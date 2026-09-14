'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { LeaveType } from '@/types/database';

export async function submitLeaveAction(formData: FormData) {
  const jenis = formData.get('jenis') as LeaveType;
  const tgl_mulai = formData.get('tgl_mulai') as string;
  const tgl_selesai = formData.get('tgl_selesai') as string;
  const alasan = formData.get('alasan') as string;
  const fileBukti = formData.get('bukti') as File | null;

  if (!jenis || !tgl_mulai || !tgl_selesai || !alasan) {
    return { error: 'Semua kolom wajib diisi dengan benar.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesi login telah berakhir.' };
  }

  let bukti_url: string | null = null;

  // Upload lampiran bukti jika ada
  if (fileBukti && fileBukti.size > 0) {
    try {
      const fileExt = fileBukti.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const arrayBuffer = await fileBukti.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('bukti-izin')
        .upload(fileName, buffer, {
          contentType: fileBukti.type,
          upsert: true,
        });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('bukti-izin').getPublicUrl(fileName);
        bukti_url = publicUrl;
      }
    } catch (e) {
      console.warn('Gagal upload lampiran surat:', e);
    }
  }

  const { error } = await supabase.from('leave_requests').insert({
    user_id: user.id,
    jenis,
    tgl_mulai,
    tgl_selesai,
    alasan,
    bukti_url,
    status: 'PENDING',
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/guru/izin');
  revalidatePath('/admin/persetujuan');

  return { success: true, message: 'Permohonan izin berhasil diajukan dan menunggu persetujuan Admin.' };
}
