const FILTER_CATEGORIES = [
  {
    key: 'base',
    label: 'Protección base',
    description: 'Publicidad maliciosa y amenazas',
    icon: 'shield',
    listPath: 'rules/list_base.json',
    defaultEnabled: true,
    featured: true
  },
  {
    key: 'porn',
    label: 'Contenido adulto',
    description: 'Sitios para mayores de edad',
    icon: 'adult',
    listPath: 'rules/list_porn.json',
    defaultEnabled: true
  },
  {
    key: 'gambling',
    label: 'Apuestas y casinos',
    description: 'Juego online y apuestas',
    icon: 'game',
    listPath: 'rules/list_gambling.json',
    defaultEnabled: true
  },
  {
    key: 'fakenews',
    label: 'Desinformación',
    description: 'Fuentes de noticias poco fiables',
    icon: 'news',
    listPath: 'rules/list_fakenews.json',
    defaultEnabled: true
  },
  {
    key: 'social',
    label: 'Redes sociales',
    description: 'Plataformas sociales y distracciones',
    icon: 'social',
    listPath: 'rules/list_social.json',
    defaultEnabled: true
  }
];

const DEFAULT_FILTERS = Object.fromEntries(
  FILTER_CATEGORIES.map(({ key, defaultEnabled }) => [key, defaultEnabled])
);
