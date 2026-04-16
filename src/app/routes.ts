export const routes = {
  home: '/',
  fazer: '/fazer',
  fazerHoje: '/fazer/hoje',
  fazerTimeline: '/fazer/timeline',
  fazerRitual: '/fazer/ritual',
  fazerEncerramento: '/fazer/encerramento',
  fazerAtencao: '/fazer/atencao',
  planejar: '/planejar',
  memoria: '/memoria',
  central: '/central',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const;

export const tabRoutes = [
  { label: 'Fazer', path: routes.fazer },
  { label: 'Planejar', path: routes.planejar },
  { label: 'Memória', path: routes.memoria },
] as const;
