package repository

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
)

func AddPlatformsToWishlistItem(pool *pgxpool.Pool, wishlistID int, platformIDs []int) error {
	var err error

	sql := "INSERT INTO wishlist_platforms (wishlist_id, platform_id) VALUES ($1, $2)"

	for _, platformID := range platformIDs {
		_, err = pool.Exec(context.Background(), sql, wishlistID, platformID)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetPlatformsForWishlistItem(pool *pgxpool.Pool, wishlistID int) ([]models.Platform, error) {
	var platforms []models.Platform
	var err error
	var rows pgx.Rows

	sql := `SELECT p.id, p.name 
			FROM platforms p
			JOIN wishlist_platforms wp ON wp.platform_id = p.id
			WHERE wp.wishlist_id = $1`

	rows, err = pool.Query(context.Background(), sql, wishlistID)
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

func RemoveAllPlatformsFromWishlistItem(pool *pgxpool.Pool, wishlistID int) error {
	var err error

	sql := "DELETE FROM wishlist_platforms WHERE wishlist_id = $1"

	_, err = pool.Exec(context.Background(), sql, wishlistID)
	if err != nil {
		return err
	}

	return nil
}

func AddGenresToWishlistItem(pool *pgxpool.Pool, wishlistID int, genreIDs []int) error {
	var err error

	sql := "INSERT INTO wishlist_genres (wishlist_id, genre_id) VALUES ($1, $2)"

	for _, genreID := range genreIDs {
		_, err = pool.Exec(context.Background(), sql, wishlistID, genreID)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetGenresForWishlistItem(pool *pgxpool.Pool, wishlistID int) ([]models.Genre, error) {
	var genres []models.Genre
	var err error
	var rows pgx.Rows

	sql := `SELECT g.id, g.name 
			FROM genres g
			JOIN wishlist_genres wg ON wg.genre_id = g.id
			WHERE wg.wishlist_id = $1`

	rows, err = pool.Query(context.Background(), sql, wishlistID)
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

func RemoveAllGenresFromWishlistItem(pool *pgxpool.Pool, wishlistID int) error {
	var err error

	sql := "DELETE FROM wishlist_genres WHERE wishlist_id = $1"

	_, err = pool.Exec(context.Background(), sql, wishlistID)
	if err != nil {
		return err
	}

	return nil
}
