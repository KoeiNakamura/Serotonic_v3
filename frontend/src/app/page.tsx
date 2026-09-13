'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch, getAccessToken, clearTokens } from '@/lib/api';

type Status = { message: string; time?: string; note?: string } | null;

export default function Home() {
  const [status, setStatus] = useState<Status>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
      return;
    }
    authFetch('/me/')
      .then((res) => res.json())
      .then((data) => setUsername(data.username));
  }, [router]);

  const recordWake = async () => {
    setLoading(true);
    setStatus(null);

    const sleepTimeInput = window.prompt(
      '昨夜は何時に寝ましたか？(例: 23:30)\n日付をまたいだ場合は24を超えて入力してください(深夜1:15なら25:15)\n分からなければ空欄のままでOKです'
    );

    let note: string | undefined;

    try {
      if (sleepTimeInput && sleepTimeInput.trim() !== '') {
        const sleepRes = await authFetch('/sleep/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ time: sleepTimeInput.trim() }),
        });
        if (!sleepRes.ok) {
          note = '(就寝時刻の記録には失敗しました。形式はHH:MMです)';
        }
      }

      const wakeRes = await authFetch('/wake/', { method: 'POST' });
      if (!wakeRes.ok) throw new Error('Request failed');
      const data = await wakeRes.json();

      setStatus({
        message: '起床を記録しました',
        time: data.wake_time,
        note,
      });
    } catch (err) {
      setStatus({ message: '記録に失敗しました。もう一度お試しください。' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.replace('/login');
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
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Serotonic</h1>
      {username && (
        <p style={{ fontSize: '1rem', color: '#9ca3af', marginTop: '-16px' }}>
          Hello, {username}！
        </p>
      )}

      <button
        onClick={recordWake}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        disabled={loading}
        style={{
          width: '80%',
          maxWidth: '320px',
          padding: '24px',
          fontSize: '1.25rem',
          borderRadius: '16px',
          border: 'none',
          background: pressed ? '#d99a1a' : '#fbbf24',
          color: '#1f2937',
          transform: pressed ? 'scale(0.96)' : 'scale(1)',
          transition: 'transform 0.1s ease, background 0.1s ease',
        }}
      >
        {loading ? '記録中...' : '☀️ 起床'}
      </button>

      {status && (
        <div style={{ textAlign: 'center' }}>
          <p>{status.message}</p>
          {status.time && (
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {new Date(status.time).toLocaleString('ja-JP')}
            </p>
          )}
          {status.note && (
            <p style={{ fontSize: '0.75rem', color: '#dc2626' }}>{status.note}</p>
          )}
        </div>
      )}

      <Link href="/logs" style={{ marginTop: '16px', color: '#4338ca' }}>
        ログ一覧を見る →
      </Link>

      <button
        onClick={handleLogout}
        style={{
          marginTop: '8px',
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          fontSize: '0.875rem',
          textDecoration: 'underline',
        }}
      >
        ログアウト
      </button>
    </main>
  );
}