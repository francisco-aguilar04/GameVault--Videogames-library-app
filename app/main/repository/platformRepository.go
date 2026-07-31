package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
)

func CreatePlatform(pool *pgxpool.Pool, name string) (models.Platform, error) {
	var platform models.Platform
	var err error

	//Creates the sql instruction where $1 is the value of name parameter (first parameter)
	sql := "INSERT INTO platforms (name) VALUES ($1) RETURNING id, name"

	//Executes the instruction in sql with parameter name, using scan to do it (ID is serial)
	err = pool.QueryRow(context.Background(), sql, name).Scan(&platform.ID, &platform.Name)
	if err != nil {
		return models.Platform{}, err
	}

	return platform, nil
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

func GetAllPlatforms(pool *pgxpool.Pool) ([]models.Platform, error) {
	var platforms []models.Platform
	var err error
	var rows pgx.Rows

	sql := "SELECT id, name FROM platforms"

	rows, err = pool.Query(context.Background(), sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var platform models.Platform
		err = rows.Scan(&platform.ID, &platform.Name)
		if err != nil {
			return nil, err
		}
		platforms = append(platforms, platform)
	}

	return platforms, nil
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
