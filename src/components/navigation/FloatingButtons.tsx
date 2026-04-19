import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { CreateLauncherModal } from '../../features/capture/CreateLauncherModal';
import { Button } from '../ui/Button';

export function FloatingButtons() {
  const [launcherOpen, setLauncherOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed bottom-24 right-4 z-40 flex flex-col gap-3">
        <Button className="pointer-events-auto shadow-[var(--shadow-floating)]" size="icon" ariaLabel="Busca rápida" variant="secondary">
          <Search className="h-5 w-5" />
        </Button>
        <Button className="pointer-events-auto shadow-[var(--shadow-floating)]" size="icon" ariaLabel="Criar" onClick={() => setLauncherOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <CreateLauncherModal visible={launcherOpen} onClose={() => setLauncherOpen(false)} />
    </>
  );
}
