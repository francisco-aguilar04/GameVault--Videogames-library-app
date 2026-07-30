package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"gamevault-backend/db"
	"gamevault-backend/internal/handlers"
)

func main() {

	var connString string
	var pool *pgxpool.Pool
	var err error
	var router *gin.Engine

	// Load DATABASE_URL from postgres.env into environment variables
	godotenv.Load("postgres.env")
	connString = os.Getenv("DATABASE_URL")

	// Fallback connection string for local development if postgres.env is missing
	if connString == "" {
		connString = "postgres://usuario:password@localhost:5432/gamevault"
	}

	pool, err = db.Connect(connString)
	if err != nil {
		// The server keeps starting even if the database connection fails,
		// so /health can report the failure instead of crashing the app
		log.Println("Warning: unable to connect to the database:", err)
	}

	router = gin.Default()

	router.POST("/platforms", handlers.CreatePlatformHandler(pool))
	router.DELETE("/platforms/:id", handlers.DeletePlatformHandler(pool))
	router.GET("/platforms/:id", handlers.GetPlatformHandler(pool))
	router.PUT("/platforms/:id", handlers.UpdatePlatformHandler(pool))
	router.POST("/games", handlers.CreateGameHandler(pool))
	router.GET("/games", handlers.GetAllGamesHandler(pool))
	router.GET("/games/:id", handlers.GetGameHandler(pool))
	router.PUT("/games/:id", handlers.UpdateGameHandler(pool))
	router.DELETE("/games/:id", handlers.DeleteGameHandler(pool))

	// Health check endpoint: reports whether the database connection is alive
	router.GET("/health", func(c *gin.Context) {
		if pool == nil {
			c.JSON(503, gin.H{
				"status":   "error",
				"database": "disconnected",
			})
			return
		}

		c.JSON(200, gin.H{
			"status":   "ok",
			"database": "connected",
		})
	})

	log.Println("Server ready in http://localhost:9000")
	err = router.Run(":9000")
	if err != nil {
		log.Fatalf("Error starting the server: %v", err)
	}
}
