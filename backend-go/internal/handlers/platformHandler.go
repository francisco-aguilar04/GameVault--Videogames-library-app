package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/internal/models"
	"gamevault-backend/internal/repository"
)

func CreatePlatformHandler(pool *pgxpool.Pool) gin.HandlerFunc {

	return func(c *gin.Context) {

		var input models.Platform
		var err error
		var platform models.Platform

		err = c.ShouldBindJSON(&input)

		if err != nil {

			c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})

			return

		}

		platform, err = repository.CreatePlatform(pool, input.Name)

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return

		}

		c.JSON(http.StatusCreated, platform)

	}
}

func DeletePlatformHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		err = repository.DeletePlatform(pool, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusNoContent)
	}
}

func GetPlatformHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error
		var platform models.Platform

		id, err = strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		platform, err = repository.GetPlatformByID(pool, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "plataforma no encontrada"})
			return
		}

		c.JSON(http.StatusOK, platform)
	}
}

func UpdatePlatformHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {

		var id int
		var err error
		var input models.Platform
		var platform models.Platform

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		err = c.ShouldBindJSON(&input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
			return
		}

		platform, err = repository.UpdatePlatform(pool, id, input.Name)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "plataforma no encontrada"})
			return
		}

		c.JSON(http.StatusOK, platform)
	}
}
