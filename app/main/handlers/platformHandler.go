package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
	"gamevault-backend/main/repository"
)

// Pool is captured with closure, so the internal handler
// has access to it without using a global variable.

func CreatePlatformHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input models.Platform
		var err error
		var platform models.Platform

		err = c.ShouldBindJSON(&input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
			return
		}

		platform, err = repository.CreatePlatform(pool, input.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 201 Created: the operation created a resource, so we retrieve it
		c.JSON(http.StatusCreated, platform)
	}
}

func GetPlatformHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error
		var platform models.Platform

		// c.Param always retrieves text, even though it appears as a number in the URL,
		// thats why we transform it with strconv.Atoi.
		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "invalid id"})
			return
		}

		platform, err = repository.GetPlatformByID(pool, id)
		if err != nil {
			// Any repository error comes here as "not found",without distinguishing
			// pgx.ErrNoRows from real db connection errors.
			c.JSON(http.StatusNotFound, gin.H{"Error": "platform not found"})
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
			c.JSON(http.StatusBadRequest, gin.H{"Error": "invalid ID"})
			return
		}

		err = c.ShouldBindJSON(&input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "invalid JSON"})
			return
		}

		platform, err = repository.UpdatePlatform(pool, id, input.Name)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"Error": "platform not found"})
			return
		}

		c.JSON(http.StatusOK, platform)
	}
}

func DeletePlatformHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"Error": "invalid ID"})
			return
		}

		err = repository.DeletePlatform(pool, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
			return
		}

		// 204 No Content: the operation was succesful but there are nothing to retrieve
		c.Status(http.StatusNoContent)
	}
}
