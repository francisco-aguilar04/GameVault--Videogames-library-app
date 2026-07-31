package repository

import (
	"context"
	"gamevault-backend/main/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func AddGenresToGame(pool *pgxpool.Pool, gameID int, genresIDs []int) error {

	var err error

	sql := "INSERT INTO game_genres (game_id, genre_id) VALUES ($1, $2)"

	for _, genreID := range genresIDs {

		_, err = pool.Exec(context.Background(), sql, gameID, genreID)

		if err != nil {

			return err

		}

	}

	return nil
}

func GetGenresForGame(pool *pgxpool.Pool, gameID int) ([]models.Genre, error) {
	var genres []models.Genre
	var err error
	var rows pgx.Rows

	sql := `SELECT g.id, g.name 
				FROM genres g
				JOIN game_genres gg ON gg.genre_id = g.id
				WHERE gg.game_id = $1`

	rows, err = pool.Query(context.Background(), sql, gameID)

	if err != nil {

		return nil, err

	}

	defer rows.Close()

	for rows.Next() {

		var genre models.Genre

		err = rows.Scan(&genre.ID, &genre.Name)

		if err != nil {

			return nil, err

		}

		genres = append(genres, genre)
	}

	return genres, nil
}

func RemoveAllGenresFromGame(pool *pgxpool.Pool, gameID int) error {

	var err error

	sql := "DELETE FROM game_genres WHERE game_id = $1"

	_, err = pool.Exec(context.Background(), sql, gameID)

	if err != nil {

		return err

	}

	return nil
}
