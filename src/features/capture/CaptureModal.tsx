import { BottomSheet } from '../../components/ui';
import type { CaptureType } from '../../lib/types';
import { StructuredCaptureForm } from './StructuredCaptureForm';

export function CaptureModal({
  visible,
  onClose,
  initialType = 'tarefa',
}: {
  visible: boolean;
  onClose: () => void;
  initialType?: CaptureType;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nova entrada">
      <StructuredCaptureForm initialType={initialType} onCancel={onClose} onSaved={onClose} />
    </BottomSheet>
  );
}
