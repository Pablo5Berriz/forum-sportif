// Tous les textes à l'écran. Une version anglaise = un fichier strings.en.js avec les mêmes clés.
window.STR = {
  chapters: {
    S01: '01  Localisation', S02: '02  Échelle', S03: '03  Réseau', S04: '04  Réception',
    S05: '05  Stockage', S06: '06  Commande', S07: '07  Expédition', S08: '08  Équipes',
    S09: '09  Durabilité', S10: ''
  },
  illustrative: 'Représentation illustrative',
  schematic: 'Schéma de principe — ne reproduit pas l’équipement réel',
  rail: ['Réception', 'Stockage', 'Commande', 'Préparation', 'Expédition'],

  s01: {
    montreal: 'Montréal', beauharnois: 'Beauharnois', quebec: 'QUÉBEC', ontario: 'ONTARIO',
    title1: 'BEAUHARNOIS, QUÉBEC',
    brand: 'IKEA',
    title2a: 'Centre de distribution', title2b: 'Centre de distribution aux clients',
    title2en: 'Distribution Centre + Customer Distribution Centre'
  },
  s02: {
    roleA: 'Centre de distribution', roleAsub: 'approvisionne les magasins',
    roleB: 'Centre de distribution aux clients', roleBsub: 'prépare les commandes en ligne',
    stat1: { pre: 'plus de', num: 1000000, fmt: 'sqft', label: 'pieds carrés', sub: 'plus de 60 patinoires de la LNH*' },
    stat2: { pre: 'jusqu’à', num: 244000, label: 'palettes', sub: 'capacité de stockage annoncée' },
    stat3: { pre: 'plus de', num: 380, plus: true, label: 'collaborateurs', sub: 'à l’ouverture, en 2023' },
    source: 'Sources : IKEA Canada (2023); Retail Insider (2023); Broccolini.   *Calcul : surface au sol ÷ patinoire LNH (200 × 85 pi, coins arrondis) = 61.'
  },
  s03: {
    winnipeg: 'Winnipeg', halifax: 'Halifax', toronto: 'Région de Toronto', montreal: 'Montréal',
    legStores: 'Magasins IKEA, de Winnipeg à Halifax',
    legNetwork: 'Autres centres du réseau IKEA',
    legCustomers: 'Commandes en ligne livrées aux clients',
    note: 'Destinations clients : points illustratifs',
    source: 'Sources : IKEA Canada (2023); Retail Insider (2023); La Presse canadienne (2023).'
  },
  s04: { dock: 'Quai de réception', scan: 'Palette identifiée', unit: 'Unité suivie dans le système' },
  s05: {
    big1: 'AUTOMATED STORAGE', big2: '& RETRIEVAL', short: 'ASRS',
    sub: 'Système de stockage et de récupération automatisé',
    in: 'Reçoit', store: 'Entrepose', out: 'Ressort les palettes complètes',
    inv: 'Inventaire numérique'
  },
  s06: {
    order: 'Commande en ligne', items: ['Article 1', 'Article 2', 'Article 3'],
    flow: ['Commande', 'Localisation', 'Prélèvement', 'Consolidation'],
    gtp: 'Goods-to-person', gtpFr: 'La marchandise vient à la personne',
    station: 'Poste de préparation', totes: 'Stockage de bacs'
  },
  s07: {
    box: 'Boîte ajustée à la commande', sort: 'Tri', lanes: ['Vers les magasins', 'Vers les clients'],
    dock: 'Quai d’expédition',
    track: ['Reçue', 'Localisée', 'Prélevée', 'Emballée', 'Expédiée']
  },
  s08: {
    big: '380+', bigSub: 'collaborateurs à l’ouverture, en 2023',
    roles: ['Préparation des commandes', 'Traitement des commandes', 'Qualité et recouvrement', 'Chefs d’équipe et coordination'],
    verbs: ['Prélever', 'Contrôler', 'Coordonner'],
    source: 'Fonctions tirées des offres d’emploi IKEA à Beauharnois (jobs.ikea.com). Source effectif : IKEA Canada (2023).'
  },
  s09: {
    leed: 'LEED', leedLvl: 'Argent', leedSub: 'Certification du bâtiment',
    ev: 'bornes de recharge', evSub: 'pour véhicules électriques, annoncées à l’ouverture (2023)',
    source: 'Source : IKEA Canada (2023).'
  },
  s10: { line: 'Du centre de distribution jusqu’au client.', brand: 'IKEA', place: 'BEAUHARNOIS' }
};
