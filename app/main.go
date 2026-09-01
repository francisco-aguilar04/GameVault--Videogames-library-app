package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"gamevault-backend/db"
	"gamevault-backend/main/handlers"
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

	router.StaticFile("/favicon.ico", "./resources/favicon.ico")
	router.Static("/img", "./resources/img")

	router.Static("/resources", "./resources")
	router.StaticFile("/", "./resources/index.html")

	router.POST("/platforms", handlers.CreatePlatformHandler(pool))
	router.DELETE("/platforms/:id", handlers.DeletePlatformHandler(pool))
	router.PUT("/platforms/:id", handlers.UpdatePlatformHandler(pool))

	router.GET("/platforms/:id", handlers.GetPlatformHandler(pool))
	router.GET("/platforms", handlers.GetAllPlatformsHandler(pool))

	router.GET("/games", handlers.GetAllGamesHandler(pool))
	router.GET("/games/status/:status", handlers.GetGamesByStatusHandler(pool))
	router.GET("/games/title/:title", handlers.GetGamesByTitleHandler(pool))
	router.GET("/games/platform/:platformId", handlers.GetGamesByPlatformHandler(pool))
	router.GET("/games/:id", handlers.GetGameHandler(pool))

	router.GET("/stats", handlers.GetStatsHandler(pool))
	router.GET("/stats/rating-distribution", handlers.GetRatingDistributionHandler(pool))
	router.GET("/stats/top-platforms", handlers.GetTopPlatformsHandler(pool))
	router.GET("/stats/top-genres", handlers.GetTopGenresHandler(pool))

	router.GET("/genres", handlers.GetAllGenresHandler(pool))
	router.POST("/genres", handlers.CreateGenreHandler(pool))
	router.GET("/genres/:id", handlers.GetGenreHandler(pool))
	router.PUT("/genres/:id", handlers.UpdateGenreHandler(pool))
	router.DELETE("/genres/:id", handlers.DeleteGenreHandler(pool))

	router.POST("/games", handlers.CreateGameHandler(pool))
	router.DELETE("/games/:id", handlers.DeleteGameHandler(pool))
	router.PUT("/games/:id", handlers.UpdateGameHandler(pool))

	router.POST("/wishlist", handlers.CreateWishlistItemHandler(pool))
	router.GET("/wishlist", handlers.GetAllWishlistItemsHandler(pool))
	router.GET("/wishlist/:id", handlers.GetWishlistItemHandler(pool))
	router.PUT("/wishlist/:id", handlers.UpdateWishlistItemHandler(pool))
	router.DELETE("/wishlist/:id", handlers.DeleteWishlistItemHandler(pool))
	router.POST("/wishlist/:id/move-to-library", handlers.MoveToLibraryHandler(pool))
	router.GET("/wishlist/title/:title", handlers.GetWishlistItemsByTitleHandler(pool))
	router.GET("/wishlist/platform/:platformId", handlers.GetWishlistItemsByPlatformHandler(pool))
	router.GET("/wishlist/genre/:genreId", handlers.GetWishlistItemsByGenreHandler(pool))

	router.GET("/export/csv", handlers.ExportCSVHandler(pool))

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
