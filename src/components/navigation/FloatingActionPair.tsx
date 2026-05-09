import { useState } from 'react';
import { Lightbulb, Plus } from 'lucide-react';
import { CreateLauncherModal } from '../../features/capture/CreateLauncherModal';
import { useIA } from '../../features/ia/useIA';
import { Button } from '../ui/Button';

export function FloatingActionPair() {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const { openIdea } = useIA();

  return (
    <>
      <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] right-4 z-40 flex flex-col gap-3">
        <Button className="pointer-events-auto shadow-[var(--shadow-floating)]" size="icon" ariaLabel="Idea" onClick={openIdea}>
          <Lightbulb className="h-5 w-5" />
        </Button>
        <Button className="pointer-events-auto shadow-[var(--shadow-floating)]" size="icon" ariaLabel="Capturar" onClick={() => setLauncherOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <CreateLauncherModal visible={launcherOpen} onClose={() => setLauncherOpen(false)} />
    </>
  );
}
