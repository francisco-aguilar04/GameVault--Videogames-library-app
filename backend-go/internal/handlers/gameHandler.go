package handlers

import (
	"gamevault-backend/internal/models"
	"gamevault-backend/internal/repository"
	"gamevault-backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateGameHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input models.Game
		var err error
		var game models.Game

		err = c.ShouldBindJSON(&input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
			return
		}

		game, err = service.CreateGame(pool, input)

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return

		}

		// 201 Created: the operation created a resource, so we retrieve it
		c.JSON(http.StatusCreated, game)
	}
}

func GetGameHandler(pool *pgxpool.Pool) gin.HandlerFunc {

	return func(c *gin.Context) {

		var id int
		var err error
		var game models.Game

		id, err = strconv.Atoi(c.Param("id"))

		if err != nil {

			c.JSON(http.StatusBadRequest, gin.H{"Error": "invalid id"})
			return

		}

		game, err = repository.GetGameByID(pool, id)

		if err != nil {

			c.JSON(http.StatusNotFound, gin.H{"Error": "game not found"})
			return

		}

		c.JSON(http.StatusOK, game)
	}
}

func GetAllGamesHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {

		var games []models.Game
		var err error

		games, err = repository.GetAllGames(pool)

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return

		}

		c.JSON(http.StatusOK, games)
	}
}

func UpdateGameHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {

		var id int
		var err error
		var input models.Game
		var game models.Game

		id, err = strconv.Atoi(c.Param("id"))

		if err != nil {

			c.JSON(http.StatusBadRequest, gin.H{"Error": "invalid ID"})
			return

		}

		err = c.ShouldBindJSON(&input)

		if err != nil {

			c.JSON(http.StatusBadRequest, gin.H{"Error": "invalid JSON"})
			return

		}

		game, err = service.UpdateGame(pool, id, input)

		if err != nil {

			c.JSON(http.StatusNotFound, gin.H{"Error": "game not found"})
			return

		}

		c.JSON(http.StatusOK, game)
	}
}

func DeleteGameHandler(pool *pgxpool.Pool) gin.HandlerFunc {

	return func(c *gin.Context) {

		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))

		if err != nil {

			c.JSON(http.StatusBadRequest, gin.H{"Error": "invalid ID"})
			return

		}

		err = repository.DeleteGame(pool, id)

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
			return

		}

		c.Status(http.StatusNoContent)
	}
}
