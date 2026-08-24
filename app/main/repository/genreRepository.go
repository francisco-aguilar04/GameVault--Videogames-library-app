package repository

import (
	"context"
	"gamevault-backend/main/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateGenre(pool *pgxpool.Pool, name string) (models.Genre, error) {
	var genre models.Genre
	var err error

	sql := "INSERT INTO genres (name) VALUES ($1) RETURNING id, name"

	err = pool.QueryRow(context.Background(), sql, name).Scan(&genre.ID, &genre.Name)
	if err != nil {
		return models.Genre{}, err
	}

	return genre, nil
}

func GetGenreByID(pool *pgxpool.Pool, id int) (models.Genre, error) {
	var genre models.Genre
	var err error

	sql := "SELECT id, name FROM genres WHERE id = $1"

	err = pool.QueryRow(context.Background(), sql, id).Scan(&genre.ID, &genre.Name)
	if err != nil {
		return models.Genre{}, err
	}

	return genre, nil
}

func GetAllGenres(pool *pgxpool.Pool) ([]models.Genre, error) {
	var genres []models.Genre
	var err error
	var rows pgx.Rows

	sql := "SELECT id, name FROM genres ORDER BY name"

	rows, err = pool.Query(context.Background(), sql)

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

func UpdateGenre(pool *pgxpool.Pool, id int, name string) (models.Genre, error) {
	var genre models.Genre
	var err error

	sql := "UPDATE genres SET name = $1 WHERE id = $2 RETURNING id, name"

	err = pool.QueryRow(context.Background(), sql, name, id).Scan(&genre.ID, &genre.Name)

	if err != nil {

		return models.Genre{}, err

	}

	return genre, nil
}

func DeleteGenre(pool *pgxpool.Pool, id int) error {
	var err error

	sql := "DELETE FROM genres WHERE id = $1"

	_, err = pool.Exec(context.Background(), sql, id)

	if err != nil {

		return err

	}

	return nil
}
