'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch, getAccessToken, clearTokens } from '@/lib/api';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

type Status = { message: string; time?: string; note?: string } | null;

type Recommendation = {
  recommended_bedtime: string | null;
  sample_size: number;
  min_samples: number;
};

export default function Home() {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
      return;
    }
    authFetch('/me/')
      .then((res) => res.json())
      .then((data) => setUsername(data.username));

    authFetch('/recommendation/')
      .then((res) => res.json())
      .then((data) => setRecommendation(data));
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
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Serotonic</h1>
        {username && <p className="text-muted mt-1">Hello, {username}！</p>}
      </div>

      {recommendation && (
        <Card className="text-center w-4/5 max-w-xs">
          {recommendation.recommended_bedtime ? (
            <>
              <div className="text-xs text-muted mb-1 whitespace-pre-line">
                {'これまでのあなたの記録に基づく\n本日の推奨される就寝時刻の参考値'}
              </div>
              <div className="text-2xl font-bold text-accent">
                {recommendation.recommended_bedtime}
              </div>
              <div className="text-xs text-muted mt-1">
                （{recommendation.sample_size}件のデータから算出）
              </div>
            </>
          ) : (
            <div className="text-sm text-muted">
              あと{recommendation.min_samples - recommendation.sample_size}件、調子の記録が集まると就寝時刻の参考値が表示されます
            </div>
          )}
        </Card>
      )}

      <Button variant="accent" onClick={recordWake} disabled={loading} className="w-4/5 max-w-xs">
        {loading ? '記録中...' : '☀️ 起床'}
      </Button>

      {status && (
        <div className="text-center">
          <p>{status.message}</p>
          {status.time && (
            <p className="text-sm text-muted">{new Date(status.time).toLocaleString('ja-JP')}</p>
          )}
          {status.note && <p className="text-sm text-danger">{status.note}</p>}
        </div>
      )}

      <Link href="/logs" className="text-primary mt-2">
        ログ一覧を見る →
      </Link>

      <Link href="/checkin" className="text-primary mt-1">
        今日の調子を記録する →
      </Link>

      <button onClick={handleLogout} className="text-muted text-sm underline">
        ログアウト
      </button>
    </main>
  );
}