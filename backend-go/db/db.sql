CREATE TABLE platforms (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE games (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    rating        NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5 AND (rating * 2) = FLOOR(rating * 2)),
    review        TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'jugando', 'completado')),
    release_year  SMALLINT CHECK (release_year > 1950),
    photo_url     VARCHAR(500),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE game_platforms (
    game_id      INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    platform_id  INTEGER NOT NULL REFERENCES platforms(id) ON DELETE RESTRICT,
    PRIMARY KEY (game_id, platform_id)
);