package handlers

import (
	"encoding/csv"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
	"gamevault-backend/main/repository"
)

func ExportCSVHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var games, err = repository.GetAllGames(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var platformsList []models.Platform
		platformsList, err = repository.GetAllPlatforms(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var genresList []models.Genre
		genresList, err = repository.GetAllGenres(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var platformMap = map[int]string{}
		for _, p := range platformsList {
			platformMap[p.ID] = p.Name
		}

		var genreMap = map[int]string{}
		for _, g := range genresList {
			genreMap[g.ID] = g.Name
		}

		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment; filename=gamevault_export.csv")

		var writer = csv.NewWriter(c.Writer)
		defer writer.Flush()

		writer.Write([]string{"Título", "Estado", "Rating", "Año", "Plataformas", "Géneros"})

		for _, game := range games {
			var rating string
			if game.Rating != nil {
				rating = strconv.FormatFloat(*game.Rating, 'f', 1, 64)
			}

			var year string
			if game.ReleaseYear != nil {
				year = strconv.Itoa(*game.ReleaseYear)
			}

			var platformNames []string
			for _, id := range game.PlatformIDs {
				platformNames = append(platformNames, platformMap[id])
			}

			var genreNames []string
			for _, id := range game.GenreIDs {
				genreNames = append(genreNames, genreMap[id])
			}

			writer.Write([]string{
				game.Title,
				game.Status,
				rating,
				year,
				strings.Join(platformNames, "; "),
				strings.Join(genreNames, "; "),
			})
		}
	}
}

func ExportWishlistCSVHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var items, err = repository.GetAllWishlistItems(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var platformsList []models.Platform
		platformsList, err = repository.GetAllPlatforms(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var genresList []models.Genre
		genresList, err = repository.GetAllGenres(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var platformMap = map[int]string{}
		for _, p := range platformsList {
			platformMap[p.ID] = p.Name
		}

		var genreMap = map[int]string{}
		for _, g := range genresList {
			genreMap[g.ID] = g.Name
		}

		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment; filename=gamevault_wishlist.csv")

		var writer = csv.NewWriter(c.Writer)
		defer writer.Flush()

		writer.Write([]string{"Título", "Año", "Plataformas", "Géneros", "Notas"})

		for _, item := range items {
			var year string
			if item.ReleaseYear != nil {
				year = strconv.Itoa(*item.ReleaseYear)
			}

			var notes string
			if item.Notes != nil {
				notes = *item.Notes
			}

			var platformNames []string
			for _, id := range item.PlatformIDs {
				platformNames = append(platformNames, platformMap[id])
			}

			var genreNames []string
			for _, id := range item.GenreIDs {
				genreNames = append(genreNames, genreMap[id])
			}

			writer.Write([]string{
				item.Title,
				year,
				strings.Join(platformNames, "; "),
				strings.Join(genreNames, "; "),
				notes,
			})
		}
	}
}
