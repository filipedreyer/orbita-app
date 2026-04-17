/**
 * EntitySheetWrapper
 *
 * Esta e a camada oficial de extensao do EntitySheet.
 * Toda contextualizacao adicional deve viver no wrapper e em seus componentes auxiliares,
 * preservando o nucleo do sheet sem reescrever sua logica interna.
 */
import { AnimatePresence, motion } from 'framer-motion';
import type { Item } from '../../lib/types';
import { EntitySheet } from './EntitySheet';
import { EntitySheetCommitmentFooter } from './EntitySheetCommitmentFooter';
import { EntitySheetFooter } from './EntitySheetFooter';
import { EntitySheetHeader } from './EntitySheetHeader';
import { NoteEntitySheet } from './NoteEntitySheet';

export function EntitySheetWrapper({
  item,
  visible,
  onClose,
  onEdit,
}: {
  item: Item;
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!visible) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="pointer-events-none fixed inset-0 z-[45] flex items-end justify-center p-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="pointer-events-auto w-full max-w-2xl">
            <EntitySheetHeader item={item} />
          </div>
        </motion.div>
      </AnimatePresence>

      {item.type === 'nota' ? (
        <NoteEntitySheet item={item} visible={visible} onClose={onClose} onEdit={onEdit} />
      ) : (
        <EntitySheet item={item} visible={visible} onClose={onClose} onEdit={onEdit} />
      )}

      <AnimatePresence>
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex justify-center p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut', delay: 0.04 }}
        >
          <div className="pointer-events-auto w-full max-w-2xl">
            {item.type === 'nota' ? (
              <EntitySheetFooter item={item} />
            ) : (
              <div className="space-y-3">
                <EntitySheetFooter item={item} />
                <EntitySheetCommitmentFooter item={item} />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
