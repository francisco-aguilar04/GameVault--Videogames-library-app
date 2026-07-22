package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/internal/models"
)

func CreatePlatform(pool *pgxpool.Pool, name string) (models.Platform, error) {

	var platform models.Platform
	var err error

	sql := "INSERT INTO platforms (name) VALUES ($1) RETURNING id, name"

	err = pool.QueryRow(context.Background(), sql, name).Scan(&platform.ID, &platform.Name)

	if err != nil {

		return models.Platform{}, err

	}

	return platform, nil
}

func DeletePlatform(pool *pgxpool.Pool, id int) error {

	var err error

	sql := "DELETE FROM platforms WHERE id = $1"

	_, err = pool.Exec(context.Background(), sql, id)

	if err != nil {

		return err

	}

	return nil
}

func GetPlatformByID(pool *pgxpool.Pool, id int) (models.Platform, error) {

	var platform models.Platform
	var err error

	sql := "SELECT id, name FROM platforms WHERE id = $1"

	err = pool.QueryRow(context.Background(), sql, id).Scan(&platform.ID, &platform.Name)

	if err != nil {

		return models.Platform{}, err

	}

	return platform, nil
}

func UpdatePlatform(pool *pgxpool.Pool, id int, name string) (models.Platform, error) {
	var platform models.Platform
	var err error

	sql := "UPDATE platforms SET name = $1 WHERE id = $2 RETURNING id, name"

	err = pool.QueryRow(context.Background(), sql, name, id).Scan(&platform.ID, &platform.Name)
	if err != nil {
		return models.Platform{}, err
	}

	return platform, nil
}
