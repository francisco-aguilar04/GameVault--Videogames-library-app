'''INSERT INTO games (title, rating, review, status, release_year, photo_url)
VALUES ('Hollow Knight', 4.5, 'Precioso apartado artístico', 'completado', 2017, 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=300&h=400&fit=crop&auto=format');'''

'''INSERT INTO platforms (name) VALUES ('PC');'''

'''INSERT INTO game_platforms (game_id, platform_id)
VALUES (
    (SELECT id FROM games WHERE title = 'Hollow Knight'),
    (SELECT id FROM platforms WHERE name = 'PC')
);'''
UPDATE games 
SET photo_url = 'UPDATE games 
SET photo_url = 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=300&h=400&fit=crop&auto=format'
WHERE title = 'Hollow Knight';'
WHERE title = 'Hollow Knight';

