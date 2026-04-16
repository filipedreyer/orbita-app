import { Moon, Sparkles } from 'lucide-react';
import { PlaceholderScreen } from '../../components/layout/PlaceholderScreen';

export function FazerHomePage() {
  return (
    <PlaceholderScreen
      eyebrow="Fazer"
      title="Cockpit diário"
      description="Base pronta para Hoje, Timeline, Ritual e Encerramento. Nesta fase o foco é estrutural: rotas, layout, estado e componentes compartilhados."
      actions={[
        { label: 'Ritual', icon: Sparkles },
        { label: 'Encerrar dia', icon: Moon, variant: 'secondary' },
      ]}
    />
  );
}
