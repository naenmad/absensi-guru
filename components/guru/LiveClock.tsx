'use client';

import React, { useState, useEffect } from 'react';

export default function LiveClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-3xl font-semibold tracking-tight tabular-nums font-mono text-white">
      {time || '--:--:--'} <span className="text-xs font-normal text-slate-400 font-sans tracking-normal">WIB</span>
    </div>
  );
}
