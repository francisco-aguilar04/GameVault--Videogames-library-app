package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/internal/models"
)

func CreateGame(pool *pgxpool.Pool, game models.Game) (models.Game, error) {

	var err error

	sql := `INSERT INTO games (title, rating, review, status, release_year, photo_url) 
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, rating, review, status,
		 release_year, photo_url, created_at`

	err = pool.QueryRow(context.Background(), sql, game.Title, game.Rating, game.Review, game.Status, game.ReleaseYear, game.PhotoURL).
		Scan(&game.ID, &game.Title, &game.Rating, &game.Review, &game.Status, &game.ReleaseYear, &game.PhotoURL, &game.CreatedAt)

	if err != nil {

		return models.Game{}, err

	}

	return game, nil
}

func GetGameByID(pool *pgxpool.Pool, id int) (models.Game, error) {

	var game models.Game
	var err error

	sql := `SELECT id, title, rating, review, status, release_year, photo_url, 
			created_at FROM games WHERE id = $1`

	err = pool.QueryRow(context.Background(), sql, id).
		Scan(&game.ID, &game.Title, &game.Rating, &game.Review, &game.Status,
			&game.ReleaseYear, &game.PhotoURL, &game.CreatedAt)

	if err != nil {

		return models.Game{}, err

	}

	return game, nil
}

func GetAllGames(pool *pgxpool.Pool) ([]models.Game, error) {
	var games []models.Game
	var err error
	var rows pgx.Rows
	var game models.Game

	sql := "SELECT id, title, rating, review, status, release_year, photo_url, created_at FROM games"

	rows, err = pool.Query(context.Background(), sql)

	if err != nil {

		return nil, err

	}

	defer rows.Close()

	for rows.Next() {

		err = rows.Scan(&game.ID, &game.Title, &game.Rating, &game.Review, &game.Status, &game.ReleaseYear, &game.PhotoURL, &game.CreatedAt)

		if err != nil {

			return nil, err

		}

		games = append(games, game)

	}

	return games, nil
}

func UpdateGame(pool *pgxpool.Pool, id int, input models.Game) (models.Game, error) {

	var game models.Game
	var err error

	game, err = GetGameByID(pool, id)

	if err != nil {

		return models.Game{}, err

	}

	if input.Title != "" {

		game.Title = input.Title

	}

	if input.Status != "" {

		game.Status = input.Status

	}

	if input.Rating != nil {

		game.Rating = input.Rating

	}

	if input.Review != nil {

		game.Review = input.Review

	}

	if input.ReleaseYear != nil {

		game.ReleaseYear = input.ReleaseYear

	}

	if input.PhotoURL != nil {

		game.PhotoURL = input.PhotoURL

	}

	sql := `UPDATE games 
		SET title = $1, rating = $2, review = $3, status = $4, release_year = $5, photo_url = $6 
		WHERE id = $7 
		RETURNING id, title, rating, review, status, release_year, photo_url, created_at`

	err = pool.QueryRow(context.Background(), sql, game.Title, game.Rating, game.Review,
		game.Status, game.ReleaseYear, game.PhotoURL, id).
		Scan(&game.ID, &game.Title, &game.Rating, &game.Review, &game.Status,
			&game.ReleaseYear, &game.PhotoURL, &game.CreatedAt)

	if err != nil {

		return models.Game{}, err

	}

	return game, nil
}

func DeleteGame(pool *pgxpool.Pool, id int) error {
	var err error

	sql := "DELETE FROM games WHERE id = $1"

	// Exec instead of QueryRow because DELETE doesn't retrieve any rows
	//_, makes the first value retrieved ignored (the command tag saying how many rows were affected)
	_, err = pool.Exec(context.Background(), sql, id)

	if err != nil {

		return err

	}

	return nil
}
