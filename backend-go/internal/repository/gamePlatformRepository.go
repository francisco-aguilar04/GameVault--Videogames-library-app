package repository

import (
	"context"
	"gamevault-backend/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func AddPlatformsToGame(pool *pgxpool.Pool, gameID int, platformIDs []int) error {

	var err error

	sql := "INSERT INTO game_platforms (game_id, platform_id) VALUES ($1, $2)"

	for _, platformID := range platformIDs {

		_, err = pool.Exec(context.Background(), sql, gameID, platformID)

		if err != nil {

			return err

		}

	}

	return nil
}

func GetPlatformsForGame(pool *pgxpool.Pool, gameID int) ([]models.Platform, error) {
	var platforms []models.Platform
	var err error
	var rows pgx.Rows
	var platform models.Platform

	sql := `SELECT p.id, p.name 
				FROM platforms p
				JOIN game_platforms gp ON gp.platform_id = p.id
				WHERE gp.game_id = $1`

	rows, err = pool.Query(context.Background(), sql, gameID)

	if err != nil {

		return nil, err

	}

	defer rows.Close()

	for rows.Next() {

		err = rows.Scan(&platform.ID, &platform.Name)

		if err != nil {

			return nil, err

		}

		platforms = append(platforms, platform)
	}

	return platforms, nil
}

func RemoveAllPlatformsFromGame(pool *pgxpool.Pool, gameID int) error {

	var err error

	sql := "DELETE FROM game_platforms WHERE game_id = $1"

	_, err = pool.Exec(context.Background(), sql, gameID)

	if err != nil {

		return err

	}

	return nil
}
