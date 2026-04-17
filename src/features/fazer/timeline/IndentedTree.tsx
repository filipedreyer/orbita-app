import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { DependencyTreeNode } from '../domain/derived';

function TreeBranch({
  node,
  depth,
  highlightedChainIds,
}: {
  node: DependencyTreeNode;
  depth: number;
  highlightedChainIds: Set<string>;
}) {
  const isHighlighted = highlightedChainIds.size === 0 || highlightedChainIds.has(node.item.id);

  return (
    <motion.div className="space-y-2" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 + depth * 0.03 }}>
      <div className="relative">
        {depth > 0 ? <div className="absolute -left-3 top-0 h-full w-px bg-[var(--border)]" /> : null}
        <div
          className={`rounded-2xl border px-4 py-3 ${
            isHighlighted ? 'border-[var(--teal)] bg-[var(--teal-light)]' : 'border-[var(--border)] bg-[var(--surface-alt)]'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <p className="text-sm font-medium text-[var(--text)]">{node.item.title}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {node.item.type}
            {node.isFocusItem ? ' · item do dia' : ' · contexto'}
          </p>
        </div>
      </div>

      {node.children.map((child) => (
        <TreeBranch key={child.item.id} node={child} depth={depth + 1} highlightedChainIds={highlightedChainIds} />
      ))}
    </motion.div>
  );
}

export function IndentedTree({
  tree,
  highlightedChainIds,
}: {
  tree: DependencyTreeNode[];
  highlightedChainIds: Set<string>;
}) {
  if (tree.length === 0) {
    return (
      <Card className="space-y-3 p-4">
        <h3 className="text-lg font-semibold">Arvore indentada</h3>
        <p className="text-sm text-[var(--text-secondary)]">Nenhuma estrutura de dependencia para exibir hoje.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-[var(--teal)]" />
        <h3 className="text-lg font-semibold">Arvore indentada</h3>
      </div>
      <div className="space-y-3">
        {tree.map((node) => (
          <TreeBranch key={node.item.id} node={node} depth={0} highlightedChainIds={highlightedChainIds} />
        ))}
      </div>
    </Card>
  );
}
