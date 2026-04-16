/**
 * EntitySheetWrapper
 *
 * Esta é a camada oficial de extensão do EntitySheet.
 * Toda contextualização adicional deve viver no wrapper e em seus componentes auxiliares,
 * preservando o núcleo do sheet sem reescrever sua lógica interna.
 */
import type { Item } from '../../lib/types';
import { EntitySheet } from './EntitySheet';
import { EntitySheetFooter } from './EntitySheetFooter';
import { EntitySheetHeader } from './EntitySheetHeader';

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
      <div className="pointer-events-none fixed inset-0 z-[45] flex items-end justify-center p-4">
        <div className="pointer-events-auto w-full max-w-2xl">
          <EntitySheetHeader item={item} />
        </div>
      </div>
      <EntitySheet item={item} visible={visible} onClose={onClose} onEdit={onEdit} />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex justify-center p-4">
        <div className="pointer-events-auto w-full max-w-2xl">
          <EntitySheetFooter item={item} />
        </div>
      </div>
    </>
  );
}
