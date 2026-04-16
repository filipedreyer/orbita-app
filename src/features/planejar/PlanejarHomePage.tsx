import { FolderKanban, Shield, Target } from 'lucide-react';
import { PlaceholderScreen } from '../../components/layout/PlaceholderScreen';

export function PlanejarHomePage() {
  return (
    <PlaceholderScreen
      eyebrow="Planejar"
      title="Portfólio estratégico"
      description="Estrutura inicial para metas, projetos, hábitos e inegociáveis. Os cards detalhados entram nas próximas fases."
      actions={[
        { label: 'Metas', icon: Target },
        { label: 'Projetos', icon: FolderKanban, variant: 'secondary' },
        { label: 'Inegociáveis', icon: Shield, variant: 'secondary' },
      ]}
    />
  );
}
