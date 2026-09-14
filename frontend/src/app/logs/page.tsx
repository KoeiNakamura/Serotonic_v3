'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch, getAccessToken } from '@/lib/api';
import { Card } from '@/components/Card';

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
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">ログ一覧</h1>

      {loading && <p className="text-muted">読み込み中...</p>}
      {!loading && sessions.length === 0 && <p className="text-muted">まだ記録がありません。</p>}

      <ul className="flex flex-col gap-3 list-none p-0">
        {sessions.map((session) => (
          <li key={session.sleep_date}>
            <Card>
              <div className="font-bold mb-1">{session.sleep_date}の夜</div>
              <div>🌙 就寝: {formatTime(session.sleep_time)}</div>
              <div>☀️ 起床: {formatTime(session.wake_time)}</div>
              <div className="mt-1 text-primary font-bold">
                💤 睡眠時間: {formatDuration(session.duration_minutes)}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center">
        <Link href="/" className="text-primary">
          ← ボタンページに戻る
        </Link>
      </div>
    </main>
  );
}