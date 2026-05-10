import { CaptureSurface } from './CaptureSurface';

export function CreateLauncherModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return <CaptureSurface visible={visible} onClose={onClose} />;
}
