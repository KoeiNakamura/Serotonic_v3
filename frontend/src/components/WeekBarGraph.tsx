type Session = {
  sleep_date: string;
  duration_minutes: number | null;
};

const MAX_MINUTES = 720; // 12時間を満タンの基準にする
const BAR_MAX_HEIGHT = 120; // px

const weekdayLabel = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
};

const formatShort = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
};

export function WeekBarGraph({ sessions }: { sessions: Session[] }) {
  const last7 = [...sessions]
    .sort((a, b) => a.sleep_date.localeCompare(b.sleep_date))
    .slice(-7);

  if (last7.length === 0) return null;

  return (
    <div className="flex items-end justify-between gap-2 h-[150px] mb-6">
      {last7.map((s) => {
        const minutes = s.duration_minutes ?? 0;
        const height = Math.min(minutes / MAX_MINUTES, 1) * BAR_MAX_HEIGHT;
        return (
          <div key={s.sleep_date} className="flex flex-col items-center flex-1">
            <span className="text-xs text-muted mb-1">
              {s.duration_minutes !== null ? formatShort(minutes) : '-'}
            </span>
            <div
              className="w-full rounded-t-md bg-accent"
              style={{ height: `${Math.max(height, 4)}px` }}
            />
            <span className="text-xs text-muted mt-1">{weekdayLabel(s.sleep_date)}</span>
          </div>
        );
      })}
    </div>
  );
}