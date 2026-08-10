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
