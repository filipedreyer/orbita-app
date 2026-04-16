import { Plus, Search } from 'lucide-react';
import { Button } from '../ui/Button';

export function FloatingButtons() {
  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-40 flex flex-col gap-3">
      <Button className="pointer-events-auto shadow-[0_4px_16px_rgba(14,107,107,0.35)]" size="icon" ariaLabel="Busca rápida" variant="secondary">
        <Search className="h-5 w-5" />
      </Button>
      <Button className="pointer-events-auto shadow-[0_4px_16px_rgba(14,107,107,0.35)]" size="icon" ariaLabel="Captura">
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
