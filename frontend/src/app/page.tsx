'use client';

import { useState } from 'react';

type Status = { message: string; time?: string } | null;

export default function Home() {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState<'wake' | 'sleep' | null>(null);

  const recordEvent = async (type: 'wake' | 'sleep') => {
    setLoading(type);
    setStatus(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${type}/`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      const time = type === 'wake' ? data.wake_time : data.sleep_time;
      setStatus({
        message: type === 'wake' ? '起床を記録しました' : '就寝を記録しました',
        time,
      });
    } catch (err) {
      setStatus({ message: '記録に失敗しました。もう一度お試しください。' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '24px',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Serotonic</h1>

      <button
        onClick={() => recordEvent('wake')}
        disabled={loading !== null}
        style={{
          width: '80%',
          maxWidth: '320px',
          padding: '24px',
          fontSize: '1.25rem',
          borderRadius: '16px',
          border: 'none',
          background: '#fbbf24',
          color: '#1f2937',
        }}
      >
        {loading === 'wake' ? '記録中...' : '☀️ 起床'}
      </button>

      <button
        onClick={() => recordEvent('sleep')}
        disabled={loading !== null}
        style={{
          width: '80%',
          maxWidth: '320px',
          padding: '24px',
          fontSize: '1.25rem',
          borderRadius: '16px',
          border: 'none',
          background: '#4338ca',
          color: '#fff',
        }}
      >
        {loading === 'sleep' ? '記録中...' : '🌙 就寝'}
      </button>

      {status && (
        <div style={{ textAlign: 'center' }}>
          <p>{status.message}</p>
          {status.time && (
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {new Date(status.time).toLocaleString('ja-JP')}
            </p>
          )}
        </div>
      )}
    </main>
  );
}