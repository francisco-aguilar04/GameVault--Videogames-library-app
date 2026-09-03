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

func GetGamesByTitle(pool *pgxpool.Pool, title string) ([]models.Game, error) {

	var games []models.Game
	var err error

	games, err = repository.GetGamesByTitle(pool, title)
	if err != nil {
		return nil, err
	}

	if games == nil {
		games = []models.Game{}
	}

	return games, nil
}

func GetGamesByPlatform(pool *pgxpool.Pool, platformID int) ([]models.Game, error) {
	var games []models.Game
	var err error

	games, err = repository.GetGamesByPlatform(pool, platformID)
	if err != nil {
		return nil, err
	}

	if games == nil {
		games = []models.Game{}
	}

	return games, nil
}

func GetGamesByGenre(pool *pgxpool.Pool, genreID int) ([]models.Game, error) {
	var games []models.Game
	var err error

	games, err = repository.GetGamesByGenre(pool, genreID)
	if err != nil {
		return nil, err
	}

	if games == nil {
		games = []models.Game{}
	}

	return games, nil
}

type ImportRow struct {
	Title         string
	Status        string
	Rating        *float64
	ReleaseYear   *int
	PhotoURL      *string
	Review        *string
	PlatformNames []string
	GenreNames    []string
}

func ReplaceLibraryFromCSV(pool *pgxpool.Pool, rows []ImportRow) (int, error) {
	var err error
	var count int

	err = repository.DeleteAllGames(pool)
	if err != nil {
		return 0, err
	}

	for _, row := range rows {
		var newGame models.Game
		newGame.Title = row.Title
		newGame.Status = row.Status
		newGame.Rating = row.Rating
		newGame.ReleaseYear = row.ReleaseYear
		newGame.PhotoURL = row.PhotoURL
		newGame.Review = row.Review

		for _, name := range row.PlatformNames {
			var platform models.Platform
			platform, err = repository.GetOrCreatePlatformByName(pool, name)
			if err != nil {
				return count, err
			}
			newGame.PlatformIDs = append(newGame.PlatformIDs, platform.ID)
		}

		for _, name := range row.GenreNames {
			var genre models.Genre
			genre, err = repository.GetOrCreateGenreByName(pool, name)
			if err != nil {
				return count, err
			}
			newGame.GenreIDs = append(newGame.GenreIDs, genre.ID)
		}

		_, err = CreateGame(pool, newGame)
		if err != nil {
			return count, err
		}

		count++
	}

	return count, nil
}
