package models

type Stats struct {
	TotalGames    int      `json:"total_games"`
	Completed     int      `json:"completed"`
	Playing       int      `json:"playing"`
	Pending       int      `json:"pending"`
	AverageRating *float64 `json:"average_rating"`
	TopGenre      *string  `json:"top_genre"`
}
