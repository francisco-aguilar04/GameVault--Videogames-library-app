package models

import "time"

type WishlistItem struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	PhotoURL    *string   `json:"photo_url"`
	ReleaseYear *int      `json:"release_year"`
	Notes       *string   `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	PlatformIDs []int     `json:"platform_ids"`
	GenreIDs    []int     `json:"genre_ids"`
}
