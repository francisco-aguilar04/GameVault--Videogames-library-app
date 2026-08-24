package handlers

import (
	"gamevault-backend/main/models"
	"gamevault-backend/main/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetAllGenresHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var genres []models.Genre
		var err error

		genres, err = repository.GetAllGenres(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, genres)
	}
}

func CreateGenreHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input models.Genre
		var err error

		err = c.ShouldBindJSON(&input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
			return
		}

		var genre models.Genre
		genre, err = repository.CreateGenre(pool, input.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, genre)
	}
}

func GetGenreHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		var genre models.Genre
		genre, err = repository.GetGenreByID(pool, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "género no encontrado"})
			return
		}

		c.JSON(http.StatusOK, genre)
	}
}

func UpdateGenreHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		var input models.Genre
		err = c.ShouldBindJSON(&input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
			return
		}

		var genre models.Genre
		genre, err = repository.UpdateGenre(pool, id, input.Name)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "género no encontrado"})
			return
		}

		c.JSON(http.StatusOK, genre)
	}
}

func DeleteGenreHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		err = repository.DeleteGenre(pool, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusNoContent)
	}
}
