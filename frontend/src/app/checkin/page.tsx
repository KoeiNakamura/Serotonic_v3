'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch, getAccessToken } from '@/lib/api';
import { Card } from '@/components/Card';

type Timing = 'wake' | 'midday' | 'bedtime';

const TIMING_LABELS: Record<Timing, string> = {
  wake: '☀️ 起床時の気分',
  midday: '☕ 日中の眠気のなさ',
  bedtime: '🌙 就寝前の疲労感のなさ',
};

const TIMINGS: Timing[] = ['wake', 'midday', 'bedtime'];

export default function CheckInPage() {
  const [ratings, setRatings] = useState<Partial<Record<Timing, number>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Timing | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
      return;
    }
    authFetch('/checkin/today/')
      .then((res) => res.json())
      .then((data) => setRatings(data))
      .finally(() => setLoading(false));
  }, [router]);

  const submit = async (timing: Timing, rating: number) => {
    setSubmitting(timing);
    try {
      const res = await authFetch('/checkin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timing, rating }),
      });
      if (res.ok) {
        setRatings((prev) => ({ ...prev, [timing]: rating }));
      }
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">今日の調子</h1>
        <Link href="/" className="text-primary text-sm">
          ← 戻る
        </Link>
      </div>

      {loading && <p className="text-muted">読み込み中...</p>}

      {!loading && (
        <div className="flex flex-col gap-4">
          {TIMINGS.map((timing) => (
            <Card key={timing}>
              <div className="mb-3">{TIMING_LABELS[timing]}</div>
              <div className="flex gap-2 justify-between">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => submit(timing, n)}
                    disabled={submitting === timing}
                    className={`flex-1 py-3 rounded-xl text-lg font-bold transition-colors ${
                      ratings[timing] === n
                        ? 'bg-accent text-gray-900'
                        : 'bg-surface border border-border text-muted'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}