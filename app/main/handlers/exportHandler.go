package handlers

import (
	"encoding/csv"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
	"gamevault-backend/main/repository"
	"gamevault-backend/main/service"
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

		writer.Write([]string{"Título", "Estado", "Rating", "Año", "Foto URL", "Reseña", "Plataformas", "Géneros"})

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

			var photoURL string
			if game.PhotoURL != nil {
				photoURL = *game.PhotoURL
			}

			var review string
			if game.Review != nil {
				review = *game.Review
			}

			writer.Write([]string{
				game.Title,
				game.Status,
				rating,
				year,
				photoURL,
				review,
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

func ImportCSVHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var fileHeader *multipart.FileHeader
		var err error

		fileHeader, err = c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "archivo no recibido"})
			return
		}

		var file multipart.File
		file, err = fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer file.Close()

		var reader = csv.NewReader(file)
		var records [][]string
		records, err = reader.ReadAll()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "CSV inválido"})
			return
		}

		if len(records) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "el CSV no tiene datos"})
			return
		}

		var rows []service.ImportRow
		var i int
		for i = 1; i < len(records); i++ {
			record := records[i]

			var row service.ImportRow
			row.Title = record[0]
			row.Status = record[1]

			if record[2] != "" {
				var rating float64
				rating, err = strconv.ParseFloat(record[2], 64)
				if err == nil {
					row.Rating = &rating
				}
			}

			if record[3] != "" {
				var year int
				year, err = strconv.Atoi(record[3])
				if err == nil {
					row.ReleaseYear = &year
				}
			}

			if record[4] != "" {
				row.PhotoURL = &record[4]
			}

			if record[5] != "" {
				row.Review = &record[5]
			}

			if record[6] != "" {
				row.PlatformNames = strings.Split(record[6], "; ")
			}

			if record[7] != "" {
				row.GenreNames = strings.Split(record[7], "; ")
			}

			rows = append(rows, row)
		}

		var count int
		count, err = service.ReplaceLibraryFromCSV(pool, rows)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "imported_before_error": count})
			return
		}

		c.JSON(http.StatusOK, gin.H{"imported": count})
	}
}
