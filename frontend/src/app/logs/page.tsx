'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch, getAccessToken } from '@/lib/api';

type SleepSession = {
  sleep_date: string;
  sleep_time: string | null;
  wake_time: string | null;
  duration_minutes: number | null;
};

const formatTime = (t: string | null) =>
  t ? new Date(t).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '未記録';

const formatDuration = (minutes: number | null) => {
  if (minutes === null) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}時間${m}分`;
};

export default function LogsPage() {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
      return;
    }

    authFetch('/sessions/')
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
        ログ一覧
      </h1>

      {loading && <p>読み込み中...</p>}

      {!loading && sessions.length === 0 && <p>まだ記録がありません。</p>}

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sessions.map((session) => (
          <li
            key={session.sleep_date}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{session.sleep_date}の夜</div>
            <div>🌙 就寝: {formatTime(session.sleep_time)}</div>
            <div>☀️ 起床: {formatTime(session.wake_time)}</div>
            <div style={{ marginTop: '4px', color: '#4338ca', fontWeight: 'bold' }}>
              💤 睡眠時間: {formatDuration(session.duration_minutes)}
            </div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link href="/">← ボタンページに戻る</Link>
      </div>
    </main>
  );
}