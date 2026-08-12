package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
)

func GetStats(pool *pgxpool.Pool) (models.Stats, error) {
	var stats models.Stats
	var err error

	err = pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM games").Scan(&stats.TotalGames)
	if err != nil {
		return models.Stats{}, err
	}

	err = pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM games WHERE status = 'completado'").Scan(&stats.Completed)
	if err != nil {
		return models.Stats{}, err
	}

	err = pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM games WHERE status = 'jugando'").Scan(&stats.Playing)
	if err != nil {
		return models.Stats{}, err
	}

	err = pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM games WHERE status = 'pendiente'").Scan(&stats.Pending)
	if err != nil {
		return models.Stats{}, err
	}

	err = pool.QueryRow(context.Background(),
		"SELECT AVG(rating) FROM games WHERE rating IS NOT NULL").Scan(&stats.AverageRating)
	if err != nil {
		return models.Stats{}, err
	}

	sql := `SELECT g.name 
			FROM genres g
			JOIN game_genres gg ON gg.genre_id = g.id
			GROUP BY g.name
			ORDER BY COUNT(*) DESC
			LIMIT 1`

	err = pool.QueryRow(context.Background(), sql).Scan(&stats.TopGenre)
	if err != nil && err.Error() != "no rows in result set" {
		return models.Stats{}, err
	}

	return stats, nil
}

func GetRatingDistribution(pool *pgxpool.Pool) (map[int]int, error) {

	var distribution = map[int]int{1: 0, 2: 0, 3: 0, 4: 0, 5: 0}

	sql := `SELECT ROUND(rating)::int AS bucket, COUNT(*) 
			FROM games 
			WHERE rating IS NOT NULL 
			GROUP BY bucket`

	rows, err := pool.Query(context.Background(), sql)

	if err != nil {

		return nil, err

	}

	defer rows.Close()

	for rows.Next() {

		var bucket int
		var count int

		err = rows.Scan(&bucket, &count)

		if err != nil {

			return nil, err

		}

		if bucket >= 1 && bucket <= 5 {

			distribution[bucket] = count

		}
	}

	return distribution, nil
}
