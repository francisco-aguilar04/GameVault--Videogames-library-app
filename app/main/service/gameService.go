package service

import (
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
	"gamevault-backend/main/repository"
)

// CreateGame creates a game and, if platform ids were provided,
// associates them with the newly created game.
func CreateGame(pool *pgxpool.Pool, input models.Game) (models.Game, error) {

	var game models.Game
	var err error

	game, err = repository.CreateGame(pool, input)

	if err != nil {

		return models.Game{}, err

	}

	if len(input.PlatformIDs) > 0 {

		err = repository.AddPlatformsToGame(pool, game.ID, input.PlatformIDs)

		if err != nil {

			return models.Game{}, err

		}

		game.PlatformIDs = input.PlatformIDs
	}

	if len(input.GenreIDs) > 0 {

		err = repository.AddGenresToGame(pool, game.ID, input.GenreIDs)

		if err != nil {

			return models.Game{}, err

		}

		game.GenreIDs = input.GenreIDs

	}

	return game, nil
}

// UpdateGame updates a game and, if platform ids were provided,
// replaces its current platform associations with the new ones.
func UpdateGame(pool *pgxpool.Pool, id int, input models.Game) (models.Game, error) {

	var game models.Game
	var err error

	game, err = repository.UpdateGame(pool, id, input)

	if err != nil {

		return models.Game{}, err

	}

	if len(input.PlatformIDs) > 0 {

		err = repository.RemoveAllPlatformsFromGame(pool, id)

		if err != nil {

			return models.Game{}, err

		}

		err = repository.AddPlatformsToGame(pool, id, input.PlatformIDs)

		if err != nil {

			return models.Game{}, err

		}

		game.PlatformIDs = input.PlatformIDs
	}

	if len(input.GenreIDs) > 0 {

		err = repository.RemoveAllGenresFromGame(pool, id)

		if err != nil {

			return models.Game{}, err

		}

		err = repository.AddGenresToGame(pool, id, input.GenreIDs)

		if err != nil {

			return models.Game{}, err

		}

		game.GenreIDs = input.GenreIDs
	}

	return game, nil
}

func GetGamesByStatus(pool *pgxpool.Pool, status string) ([]models.Game, error) {

	var games []models.Game
	var err error

	games, err = repository.GetGamesByStatus(pool, status)
	if err != nil {
		return nil, err
	}

	if games == nil {
		games = []models.Game{}
	}

	return games, nil
}
