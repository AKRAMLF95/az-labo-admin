-- ============================================================
-- AZ Laboratoires — Schéma base de données Supabase
-- ============================================================

-- ── PATIENTS ─────────────────────────────────────────────────
create table patients (
  id            uuid    default gen_random_uuid() primary key,
  nom           text    not null,
  prenom        text,
  telephone     text    not null,
  whatsapp      text,
  email         text,
  age           integer,
  sexe          text,
  pref_notif    text    default 'whatsapp',
  wilaya        text,
  total_rdv     integer default 0,
  statut        text    default 'actif',   -- actif | vip | inactif
  created_at    timestamp with time zone default now()
);

-- ── ANALYSES ─────────────────────────────────────────────────
create table analyses (
  id            uuid    default gen_random_uuid() primary key,
  nom           text    not null unique,
  categorie     text    not null,
  prix          numeric not null default 300,
  actif         boolean default true,
  conditions    text[],
  created_at    timestamp with time zone default now()
);

-- ── CONDITIONS ───────────────────────────────────────────────
create table conditions (
  id            uuid    default gen_random_uuid() primary key,
  label         text    not null,
  categorie     text    not null,
  actif         boolean default true,
  utilisations  integer default 0,
  created_at    timestamp with time zone default now()
);

-- ── TECHNICIENS ──────────────────────────────────────────────
create table techniciens (
  id            uuid    default gen_random_uuid() primary key,
  nom           text    not null,
  telephone     text    not null,
  avatar        text,
  couleur       text    default '#1565C0',
  actif         boolean default true,
  created_at    timestamp with time zone default now()
);

-- ── PROMOS ───────────────────────────────────────────────────
create table promos (
  id                uuid    default gen_random_uuid() primary key,
  code              text    not null unique,
  type              text    not null,                        -- pourcentage | montant_fixe | gratuit | liste_blanche | ...
  valeur            numeric not null default 0,
  unite             text    not null default '%',            -- % | DA
  categorie         text    not null,
  description       text,
  actif             boolean default true,
  unique_par_client boolean default false,
  utilisations      integer default 0,
  max_utilisations  integer,
  date_debut        date,
  date_fin          date,
  created_at        timestamp with time zone default now()
);

-- ── PROMO LISTE BLANCHE ──────────────────────────────────────
create table promo_liste_blanche (
  id               uuid    default gen_random_uuid() primary key,
  promo_id         uuid    references promos(id) on delete cascade,
  nom              text    not null,
  prenom           text    not null,
  telephone        text    not null,
  utilise          boolean default false,
  date_utilisation timestamp with time zone,
  created_at       timestamp with time zone default now()
);

-- ── RDV ──────────────────────────────────────────────────────
create table rdv (
  id              uuid    default gen_random_uuid() primary key,
  patient_id      uuid    references patients(id) on delete set null,
  date            date    not null default current_date,
  heure           time    not null,
  lieu            text    not null default 'labo',           -- labo | domicile
  statut          text    not null default 'en_attente',     -- en_attente | confirme | en_cours | termine | annule
  technicien_id   uuid    references techniciens(id) on delete set null,
  notes           text,
  created_at      timestamp with time zone default now()
);

-- ── RDV → ANALYSES (liaison) ─────────────────────────────────
create table rdv_analyses (
  id          uuid    default gen_random_uuid() primary key,
  rdv_id      uuid    references rdv(id) on delete cascade,
  analyse_id  uuid    references analyses(id) on delete restrict,
  prix        numeric not null
);

-- ── PAIEMENTS ────────────────────────────────────────────────
create table paiements (
  id                uuid    default gen_random_uuid() primary key,
  rdv_id            uuid    references rdv(id) on delete cascade,
  sous_total        numeric not null default 0,
  remise            numeric          default 0,
  code_promo        text,
  frais_deplacement numeric          default 0,
  total             numeric not null,
  mode              text,                                    -- cash | carte | technicien
  statut            text    not null default 'non_facture',  -- non_facture | en_attente | paye_cash | paye_carte | paye_technicien | rembourse | gratuit
  date_paiement     timestamp with time zone,
  recu              text,
  technicien_id     uuid    references techniciens(id) on delete set null,
  created_at        timestamp with time zone default now()
);

-- ── COLLECTES TERRAIN ────────────────────────────────────────
create table collectes (
  id                text    primary key,                     -- COL-YYYYMMDD-XXX
  patient_id        uuid    references patients(id) on delete set null,
  patient_nom       text    not null,
  patient_telephone text,
  adresse           text,
  technicien_id     uuid    references techniciens(id) on delete set null,
  date_rdv          timestamp with time zone,
  date_collecte     timestamp with time zone,
  analyses          text[]  not null default '{}',
  montant_analyses  numeric not null default 0,
  remise            numeric          default 0,
  frais_deplacement numeric          default 0,
  total_collecte    numeric not null,
  statut            text    not null default 'collecte',     -- collecte | remis
  retard_heures     integer          default 0,
  date_remise       timestamp with time zone,
  confirmee_par     text,
  created_at        timestamp with time zone default now()
);

-- ── RÉSULTATS ────────────────────────────────────────────────
create table resultats (
  id               uuid    default gen_random_uuid() primary key,
  rdv_id           uuid    references rdv(id) on delete set null,
  patient_id       uuid    references patients(id) on delete set null,
  analyse_id       uuid    references analyses(id) on delete set null,
  valeur           text,
  unite            text,
  reference_min    text,
  reference_max    text,
  interpretation   text,                                     -- normal | bas | eleve | critique
  valide           boolean default false,
  valide_par       text,
  date_validation  timestamp with time zone,
  envoye           boolean default false,
  date_envoi       timestamp with time zone,
  created_at       timestamp with time zone default now()
);

-- ── RÔLES ────────────────────────────────────────────────────
create table roles (
  id          text    primary key,                           -- super_admin | biologiste | caissier | ...
  label       text    not null,
  icon        text,
  color       text,
  description text
);

insert into roles (id, label, icon, color) values
  ('super_admin', 'Super Admin',        '👑', '#F57F17'),
  ('biologiste',  'Biologiste',         '👩‍⚕️', '#2E7D32'),
  ('caissier',    'Caissier',           '💰', '#E65100'),
  ('technicien',  'Technicien terrain', '🚗', '#1565C0'),
  ('secretaire',  'Secrétaire',         '📋', '#7B1FA2'),
  ('manager',     'Manager',            '📊', '#455A64');

-- ── UTILISATEURS ─────────────────────────────────────────────
create table utilisateurs (
  id          uuid    default gen_random_uuid() primary key,
  nom         text    not null,
  email       text    unique,
  telephone   text,
  role_id     text    references roles(id) on delete set null,
  actif       boolean default true,
  online      boolean default false,
  created_at  timestamp with time zone default now()
);

-- ── JOURNAL D'ACTIVITÉ ───────────────────────────────────────
create table activite_log (
  id              uuid    default gen_random_uuid() primary key,
  utilisateur_id  uuid    references utilisateurs(id) on delete set null,
  utilisateur_nom text,
  action          text    not null,
  details         text,
  ip              text,
  created_at      timestamp with time zone default now()
);

-- ============================================================
-- INDEX pour les requêtes fréquentes
-- ============================================================
create index on patients (telephone);
create index on patients (statut);
create index on rdv (date);
create index on rdv (patient_id);
create index on rdv (statut);
create index on paiements (rdv_id);
create index on paiements (statut);
create index on collectes (technicien_id);
create index on collectes (statut);
create index on resultats (patient_id);
create index on resultats (valide);
create index on activite_log (utilisateur_id);
create index on activite_log (created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (activer après config auth)
-- ============================================================
-- alter table patients      enable row level security;
-- alter table rdv            enable row level security;
-- alter table paiements      enable row level security;
-- alter table collectes      enable row level security;
-- alter table resultats      enable row level security;
-- alter table utilisateurs   enable row level security;
-- alter table activite_log   enable row level security;
