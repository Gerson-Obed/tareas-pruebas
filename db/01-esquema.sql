-- Esquema mínimo para las pruebas de integración.

CREATE TABLE suscripciones (
  id         bigserial PRIMARY KEY,
  equipo     text NOT NULL,
  plan       text NOT NULL CHECK (plan IN ('libre', 'equipo', 'taller')),
  estado     text NOT NULL CHECK (estado IN ('activa', 'cancelada', 'morosa')),
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX suscripciones_equipo_idx ON suscripciones (equipo);

CREATE TABLE cupones (
  codigo       text PRIMARY KEY,
  tipo         text NOT NULL CHECK (tipo IN ('porcentaje', 'fijo')),
  valor        integer NOT NULL,
  vence_en     date NOT NULL,
  limite_usos  integer NOT NULL CHECK (limite_usos >= 0),
  usos         integer NOT NULL DEFAULT 0 CHECK (usos >= 0)
);

CREATE TABLE canjes (
  id        bigserial PRIMARY KEY,
  codigo    text NOT NULL REFERENCES cupones (codigo),
  equipo    text NOT NULL,
  canjeado_en timestamptz NOT NULL DEFAULT now()
);
