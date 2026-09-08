package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
)

func CreatePlatform(pool *pgxpool.Pool, name string, color string) (models.Platform, error) {
	var platform models.Platform
	var err error

	sql := "INSERT INTO platforms (name, color) VALUES ($1, $2) RETURNING id, name, color"

	err = pool.QueryRow(context.Background(), sql, name, color).Scan(&platform.ID, &platform.Name, &platform.Color)
	if err != nil {
		return models.Platform{}, err
	}

	return platform, nil
}

func GetPlatformByID(pool *pgxpool.Pool, id int) (models.Platform, error) {
	var platform models.Platform
	var err error

	sql := "SELECT id, name, color FROM platforms WHERE id = $1"

	err = pool.QueryRow(context.Background(), sql, id).Scan(&platform.ID, &platform.Name, &platform.Color)
	if err != nil {
		return models.Platform{}, err
	}

	return platform, nil
}

func GetAllPlatforms(pool *pgxpool.Pool) ([]models.Platform, error) {
	var platforms []models.Platform
	var err error
	var rows pgx.Rows

	sql := "SELECT id, name, color FROM platforms ORDER BY name"

	rows, err = pool.Query(context.Background(), sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var platform models.Platform
		err = rows.Scan(&platform.ID, &platform.Name, &platform.Color)
		if err != nil {
			return nil, err
		}
		platforms = append(platforms, platform)
	}

	return platforms, nil
}

func UpdatePlatform(pool *pgxpool.Pool, id int, name string, color string) (models.Platform, error) {
	var platform models.Platform
	var err error

	sql := "UPDATE platforms SET name = $1, color = $2 WHERE id = $3 RETURNING id, name, color"

	err = pool.QueryRow(context.Background(), sql, name, color, id).Scan(&platform.ID, &platform.Name, &platform.Color)
	if err != nil {
		return models.Platform{}, err
	}

	return platform, nil
}

// If there are games associated with the platform, the platform can't be deleted
func DeletePlatform(pool *pgxpool.Pool, id int) error {
	var err error

	sql := "DELETE FROM platforms WHERE id = $1"

	// Exec instead of QueryRow because DELETE doesn't retrieve any rows
	//_, makes the first value retrieved ignored (the command tag saying how many rows were affected)
	_, err = pool.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	return nil
}

func GetOrCreatePlatformByName(pool *pgxpool.Pool, name string) (models.Platform, error) {
	var platform models.Platform
	var err error

	err = pool.QueryRow(context.Background(), "SELECT id, name, color FROM platforms WHERE name = $1", name).
		Scan(&platform.ID, &platform.Name, &platform.Color)

	if err == pgx.ErrNoRows {
		return CreatePlatform(pool, name, "#6c757d")
	}
	if err != nil {
		return models.Platform{}, err
	}

	return platform, nil
}
