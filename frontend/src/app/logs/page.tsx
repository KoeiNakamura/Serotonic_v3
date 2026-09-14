'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch, getAccessToken } from '@/lib/api';
import { Card } from '@/components/Card';
import { WeekBarGraph } from '@/components/WeekBarGraph';

type SleepSession = {
  sleep_date: string;
  sleep_time: string | null;
  wake_time: string | null;
  duration_minutes: number | null;
};

const formatTime = (t: string | null) =>
  t ? new Date(t).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--';

const formatDuration = (minutes: number | null) => {
  if (minutes === null) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return { h, m };
};

const formatShortDate = (isoString: string) => {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${month}/${day}(${weekday})`;
};

const formatSessionLabel = (session: SleepSession) => {
  if (session.sleep_time && session.wake_time) {
    const sleepLabel = formatShortDate(session.sleep_time);
    const wakeLabel = formatShortDate(session.wake_time);
    return sleepLabel === wakeLabel ? sleepLabel : `${sleepLabel}→${wakeLabel}`;
  }
  if (session.sleep_time) return formatShortDate(session.sleep_time);
  if (session.wake_time) return formatShortDate(session.wake_time);
  return '';
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">ログ一覧</h1>
        <Link href="/" className="text-primary text-sm">
          ← 戻る
        </Link>
      </div>

      {!loading && sessions.length > 0 && <WeekBarGraph sessions={sessions} />}

      {loading && <p className="text-muted">読み込み中...</p>}

      {!loading && sessions.length === 0 && (
        <Card className="text-center text-muted py-8">
          まだ記録がありません。
          <br />
          起床ボタンを押すと、ここに記録が表示されます。
        </Card>
      )}

      <ul className="flex flex-col gap-3 list-none p-0">
        {sessions.map((session) => {
          const duration = formatDuration(session.duration_minutes);
          return (
            <li key={session.sleep_date}>
              <Card className="flex gap-4">
                <div className="w-1 rounded-full bg-primary shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-muted mb-2">
                    {formatSessionLabel(session)}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted">就寝</span>
                      <span className="text-lg font-medium">{formatTime(session.sleep_time)}</span>
                    </div>
                    <div className="flex-1 mx-3 h-px bg-border" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted">起床</span>
                      <span className="text-lg font-medium">{formatTime(session.wake_time)}</span>
                    </div>
                  </div>

                  {duration ? (
                    <div className="text-center bg-primary/10 rounded-xl py-2">
                      <span className="text-2xl font-bold text-accent">{duration.h}</span>
                      <span className="text-sm text-muted">時間</span>
                      <span className="text-2xl font-bold text-accent ml-1">{duration.m}</span>
                      <span className="text-sm text-muted">分</span>
                    </div>
                  ) : (
                    <div className="text-center text-muted text-sm py-2">睡眠時間: 計測中</div>
                  )}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 text-center">
        <Link href="/" className="text-primary">
          ← ボタンページに戻る
        </Link>
      </div>
    </main>
  );
}