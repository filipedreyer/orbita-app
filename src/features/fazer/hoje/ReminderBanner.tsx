import type { Item } from '../../../lib/types';
import { Card } from '../../../components/ui/Card';

export function ReminderBanner({ reminders }: { reminders: Item[] }) {
  if (reminders.length === 0) return null;

  return (
    <Card className="space-y-4 border-[color-mix(in_srgb,var(--danger)_24%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_6%,var(--surface))] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--danger)]">Lembretes do dia</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {reminders.map((reminder) => (
          <span key={reminder.id} className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)]">
            {reminder.title}
          </span>
        ))}
      </div>
    </Card>
  );
}
