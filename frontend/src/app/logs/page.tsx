'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type DailyLog = {
  id: number;
  date: string;
  wake_time: string | null;
  sleep_time: string | null;
};

const formatTime = (t: string | null) =>
  t ? new Date(t).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '未記録';

export default function LogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/`)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
        ログ一覧
      </h1>

      {loading && <p>読み込み中...</p>}

      {!loading && logs.length === 0 && <p>まだ記録がありません。</p>}

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {logs.map((log) => (
          <li
            key={log.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{log.date}</div>
            <div>☀️ 起床: {formatTime(log.wake_time)}</div>
            <div>🌙 就寝: {formatTime(log.sleep_time)}</div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link href="/">← ボタンページに戻る</Link>
      </div>
    </main>
  );
}