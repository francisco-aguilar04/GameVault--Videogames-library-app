package models

import "time"

type Game struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Rating      *float64  `json:"rating"`
	Review      *string   `json:"review"`
	Status      string    `json:"status"`
	ReleaseYear *int      `json:"release_year"`
	PhotoURL    *string   `json:"photo_url"`
	CreatedAt   time.Time `json:"created_at"`
	PlatformIDs []int     `json:"platform_ids"`
	GenreIDs    []int     `json:"genre_ids"`
}
