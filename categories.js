const FILTER_CATEGORIES = [
  {
    key: 'base',
    label: 'Core protection',
    description: 'Malicious advertising and known threats',
    icon: 'shield',
    listPath: 'rules/list_base.json',
    defaultEnabled: true,
    featured: true
  },
  {
    key: 'porn',
    label: 'Adult content',
    description: 'Mature and explicit websites',
    icon: 'adult',
    listPath: 'rules/list_porn.json',
    defaultEnabled: true
  },
  {
    key: 'gambling',
    label: 'Gambling',
    description: 'Online betting and casino websites',
    icon: 'game',
    listPath: 'rules/list_gambling.json',
    defaultEnabled: true
  },
  {
    key: 'fakenews',
    label: 'Misinformation',
    description: 'Sources listed as unreliable news',
    icon: 'news',
    listPath: 'rules/list_fakenews.json',
    defaultEnabled: true
  },
  {
    key: 'social',
    label: 'Social media',
    description: 'Social platforms and distractions',
    icon: 'social',
    listPath: 'rules/list_social.json',
    defaultEnabled: true
  }
];

const DEFAULT_FILTERS = Object.fromEntries(
  FILTER_CATEGORIES.map(({ key, defaultEnabled }) => [key, defaultEnabled])
);
