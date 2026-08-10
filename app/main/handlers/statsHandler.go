package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/repository"
)

func GetStatsHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var stats, err = repository.GetStats(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}
