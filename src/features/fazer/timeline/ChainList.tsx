import { motion } from 'framer-motion';
import { Link2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { DependencyChain } from '../domain/derived';

export function ChainList({
  chains,
  selectedChainId,
  onSelect,
}: {
  chains: DependencyChain[];
  selectedChainId: string | null;
  onSelect: (chainId: string) => void;
}) {
  if (chains.length === 0) {
    return (
      <Card className="space-y-3 p-4">
        <h3 className="text-lg font-semibold">Lista de cadeias</h3>
        <p className="text-sm text-[var(--text-secondary)]">Nenhuma cadeia ativa no dia. Os itens atuais nao dependem uns dos outros.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-lg font-semibold">Lista de cadeias</h3>
      <div className="space-y-2">
        {chains.map((chain, index) => (
          <motion.button
            key={chain.id}
            type="button"
            onClick={() => onSelect(chain.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.03 }}
            whileHover={{ y: -1 }}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
              selectedChainId === chain.id
                ? 'border-[var(--teal)] bg-[var(--teal-light)]'
                : 'border-[var(--border)] bg-[var(--surface-alt)]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              <Link2 className="h-3.5 w-3.5" />
              Cadeia
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--text)]">{chain.items.map((item) => item.title).join(' -> ')}</p>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
