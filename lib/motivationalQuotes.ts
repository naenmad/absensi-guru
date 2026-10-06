export interface Quote {
  quote: string;
  author: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    quote:
      "Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani. Di depan memberi teladan, di tengah membangkitkan semangat, di belakang memberikan dorongan.",
    author: "Ki Hajar Dewantara",
  },
  {
    quote:
      "Guru yang menginspirasi tidak hanya mentransfer ilmu pengetahuan, namun menyalakan lentera budi pekerti dan asa di hati setiap muridnya.",
    author: "Pesan Pendidik SMPN 8 Karbar",
  },
  {
    quote:
      "Setiap langkah Bapak/Ibu Guru menuju ruang kelas adalah sedekah ilmu, fondasi peradaban, dan jalan kemuliaan bagi generasi bangsa.",
    author: "Refleksi Pengabdian Guru",
  },
  {
    quote:
      "Mendidik pikiran tanpa mendidik hati bukanlah pendidikan sejati. Teruslah membimbing dengan kesabaran, cinta, dan ketulusan.",
    author: "Aristoteles",
  },
  {
    quote:
      "Satu anak, satu guru, satu buku, dan satu pena dapat mengubah dunia. Terima kasih atas dedikasi tanpa batas para pendidik.",
    author: "Malala Yousafzai",
  },
  {
    quote:
      "Pekerjaan mengajar adalah seni membuka jendela dunia bagi mereka yang sedang mencari arah masa depan.",
    author: "Mutiara Pendidikan",
  },
  {
    quote:
      "Banggalah menjadi pendidik. Guru adalah lentera penerang yang membimbing anak-anak melangkah keluar dari kegelapan ketidaktahuan.",
    author: "SMP Negeri 8 Karawang Barat",
  },
  {
    quote:
      "Keberhasilan sejati seorang guru terlihat tatkala murid-muridnya tumbuh menjadi insan yang jujur, santun, dan bermanfaat bagi sesama.",
    author: "Etika & Jiwa Pendidik",
  },
];

export function getDailyQuote(date: Date = new Date()): Quote {
  // Gunakan hari dalam tahun atau hari dalam bulan untuk konsistensi quote harian
  const dayIndex = (date.getFullYear() * 365 + date.getMonth() * 31 + date.getDate()) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[dayIndex];
}
