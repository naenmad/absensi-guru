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
    <div className="text-4xl font-extrabold tracking-tight">
      {time || '--:--:--'} <span className="text-sm font-normal text-blue-200">WIB</span>
    </div>
  );
}
