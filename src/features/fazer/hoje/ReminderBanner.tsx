import type { Item } from '../../../lib/types';
import { Card } from '../../../components/ui/Card';

export function ReminderBanner({ reminders }: { reminders: Item[] }) {
  if (reminders.length === 0) return null;

  return (
    <Card className="border-rose-200 bg-rose-50">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-500">Lembretes do dia</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {reminders.map((reminder) => (
          <span key={reminder.id} className="rounded-full bg-white px-3 py-2 text-sm text-[var(--text-secondary)]">
            {reminder.title}
          </span>
        ))}
      </div>
    </Card>
  );
}
