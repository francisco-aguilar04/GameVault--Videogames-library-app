package service

import (
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
	"gamevault-backend/main/repository"
)

func CreateWishlistItem(pool *pgxpool.Pool, input models.WishlistItem) (models.WishlistItem, error) {
	var item models.WishlistItem
	var err error

	item, err = repository.CreateWishlistItem(pool, input)
	if err != nil {
		return models.WishlistItem{}, err
	}

	if len(input.PlatformIDs) > 0 {
		err = repository.AddPlatformsToWishlistItem(pool, item.ID, input.PlatformIDs)
		if err != nil {
			return models.WishlistItem{}, err
		}
		item.PlatformIDs = input.PlatformIDs
	}

	if len(input.GenreIDs) > 0 {
		err = repository.AddGenresToWishlistItem(pool, item.ID, input.GenreIDs)
		if err != nil {
			return models.WishlistItem{}, err
		}
		item.GenreIDs = input.GenreIDs
	}

	return item, nil
}

func UpdateWishlistItem(pool *pgxpool.Pool, id int, input models.WishlistItem) (models.WishlistItem, error) {
	var item models.WishlistItem
	var err error

	item, err = repository.UpdateWishlistItem(pool, id, input)
	if err != nil {
		return models.WishlistItem{}, err
	}

	if len(input.PlatformIDs) > 0 {
		err = repository.RemoveAllPlatformsFromWishlistItem(pool, id)
		if err != nil {
			return models.WishlistItem{}, err
		}
		err = repository.AddPlatformsToWishlistItem(pool, id, input.PlatformIDs)
		if err != nil {
			return models.WishlistItem{}, err
		}
		item.PlatformIDs = input.PlatformIDs
	}

	if len(input.GenreIDs) > 0 {
		err = repository.RemoveAllGenresFromWishlistItem(pool, id)
		if err != nil {
			return models.WishlistItem{}, err
		}
		err = repository.AddGenresToWishlistItem(pool, id, input.GenreIDs)
		if err != nil {
			return models.WishlistItem{}, err
		}
		item.GenreIDs = input.GenreIDs
	}

	return item, nil
}

// MoveToLibrary crea un juego real a partir del item, trasladando
// título, foto, año, plataformas y géneros, y borra el item de la wishlist.
func MoveToLibrary(pool *pgxpool.Pool, wishlistID int) (models.Game, error) {
	var item models.WishlistItem
	var err error

	item, err = repository.GetWishlistItemByID(pool, wishlistID)
	if err != nil {
		return models.Game{}, err
	}

	var newGame models.Game
	newGame.Title = item.Title
	newGame.Status = "pendiente"
	newGame.PhotoURL = item.PhotoURL
	newGame.ReleaseYear = item.ReleaseYear
	newGame.PlatformIDs = item.PlatformIDs
	newGame.GenreIDs = item.GenreIDs

	var game models.Game
	game, err = CreateGame(pool, newGame)
	if err != nil {
		return models.Game{}, err
	}

	err = repository.DeleteWishlistItem(pool, wishlistID)
	if err != nil {
		return models.Game{}, err
	}

	return game, nil
}

type WishlistImportRow struct {
	Title         string
	ReleaseYear   *int
	PhotoURL      *string
	Notes         *string
	PlatformNames []string
	GenreNames    []string
}

func ReplaceWishlistFromCSV(pool *pgxpool.Pool, rows []WishlistImportRow) (int, error) {
	var err error
	var count int

	err = repository.DeleteAllWishlistItems(pool)
	if err != nil {
		return 0, err
	}

	for _, row := range rows {
		var newItem models.WishlistItem
		newItem.Title = row.Title
		newItem.ReleaseYear = row.ReleaseYear
		newItem.PhotoURL = row.PhotoURL
		newItem.Notes = row.Notes

		for _, name := range row.PlatformNames {
			var platform models.Platform
			platform, err = repository.GetOrCreatePlatformByName(pool, name)
			if err != nil {
				return count, err
			}
			newItem.PlatformIDs = append(newItem.PlatformIDs, platform.ID)
		}

		for _, name := range row.GenreNames {
			var genre models.Genre
			genre, err = repository.GetOrCreateGenreByName(pool, name)
			if err != nil {
				return count, err
			}
			newItem.GenreIDs = append(newItem.GenreIDs, genre.ID)
		}

		_, err = CreateWishlistItem(pool, newItem)
		if err != nil {
			return count, err
		}

		count++
	}

	return count, nil
}
