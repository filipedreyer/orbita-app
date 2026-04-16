import { Inbox, Lightbulb, Zap } from 'lucide-react';
import { PlaceholderScreen } from '../../components/layout/PlaceholderScreen';

export function MemoriaHomePage() {
  return (
    <PlaceholderScreen
      eyebrow="Memória"
      title="Capturar, reencontrar e arquivar"
      description="A home já nasce com o enquadramento certo da área de Memória. Inbox, Atalhos e Caixola serão detalhados nas fases seguintes."
      actions={[
        { label: 'Inbox', icon: Inbox },
        { label: 'Atalhos', icon: Zap, variant: 'secondary' },
        { label: 'Caixola', icon: Lightbulb, variant: 'secondary' },
      ]}
    />
  );
}
