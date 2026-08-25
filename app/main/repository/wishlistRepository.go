package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
)

func CreateWishlistItem(pool *pgxpool.Pool, item models.WishlistItem) (models.WishlistItem, error) {
	var result models.WishlistItem
	var err error

	sql := "INSERT INTO wishlist (title, photo_url, release_year, notes) VALUES ($1, $2, $3, $4) RETURNING id, title, photo_url, release_year, notes, created_at"

	err = pool.QueryRow(context.Background(), sql, item.Title, item.PhotoURL, item.ReleaseYear, item.Notes).
		Scan(&result.ID, &result.Title, &result.PhotoURL, &result.ReleaseYear, &result.Notes, &result.CreatedAt)
	if err != nil {
		return models.WishlistItem{}, err
	}

	return result, nil
}

func GetAllWishlistItems(pool *pgxpool.Pool) ([]models.WishlistItem, error) {
	var items []models.WishlistItem
	var err error
	var rows pgx.Rows

	sql := "SELECT id, title, photo_url, release_year, notes, created_at FROM wishlist ORDER BY created_at DESC"

	rows, err = pool.Query(context.Background(), sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item models.WishlistItem
		err = rows.Scan(&item.ID, &item.Title, &item.PhotoURL, &item.ReleaseYear, &item.Notes, &item.CreatedAt)
		if err != nil {
			return nil, err
		}

		var platforms []models.Platform
		platforms, err = GetPlatformsForWishlistItem(pool, item.ID)
		if err != nil {
			return nil, err
		}
		for _, p := range platforms {
			item.PlatformIDs = append(item.PlatformIDs, p.ID)
		}

		var genres []models.Genre
		genres, err = GetGenresForWishlistItem(pool, item.ID)
		if err != nil {
			return nil, err
		}
		for _, g := range genres {
			item.GenreIDs = append(item.GenreIDs, g.ID)
		}

		items = append(items, item)
	}

	return items, nil
}

func GetWishlistItemByID(pool *pgxpool.Pool, id int) (models.WishlistItem, error) {
	var item models.WishlistItem
	var err error

	sql := "SELECT id, title, photo_url, release_year, notes, created_at FROM wishlist WHERE id = $1"

	err = pool.QueryRow(context.Background(), sql, id).
		Scan(&item.ID, &item.Title, &item.PhotoURL, &item.ReleaseYear, &item.Notes, &item.CreatedAt)
	if err != nil {
		return models.WishlistItem{}, err
	}

	var platforms []models.Platform
	platforms, err = GetPlatformsForWishlistItem(pool, item.ID)
	if err != nil {
		return models.WishlistItem{}, err
	}
	for _, p := range platforms {
		item.PlatformIDs = append(item.PlatformIDs, p.ID)
	}

	var genres []models.Genre
	genres, err = GetGenresForWishlistItem(pool, item.ID)
	if err != nil {
		return models.WishlistItem{}, err
	}
	for _, g := range genres {
		item.GenreIDs = append(item.GenreIDs, g.ID)
	}

	return item, nil
}

func UpdateWishlistItem(pool *pgxpool.Pool, id int, item models.WishlistItem) (models.WishlistItem, error) {
	var result models.WishlistItem
	var err error

	sql := "UPDATE wishlist SET title = $1, photo_url = $2, release_year = $3, notes = $4 WHERE id = $5 RETURNING id, title, photo_url, release_year, notes, created_at"

	err = pool.QueryRow(context.Background(), sql, item.Title, item.PhotoURL, item.ReleaseYear, item.Notes, id).
		Scan(&result.ID, &result.Title, &result.PhotoURL, &result.ReleaseYear, &result.Notes, &result.CreatedAt)
	if err != nil {
		return models.WishlistItem{}, err
	}

	return result, nil
}

func DeleteWishlistItem(pool *pgxpool.Pool, id int) error {
	var err error

	sql := "DELETE FROM wishlist WHERE id = $1"

	_, err = pool.Exec(context.Background(), sql, id)
	if err != nil {
		return err
	}

	return nil
}
