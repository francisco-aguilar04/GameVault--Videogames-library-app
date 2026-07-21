package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"gamevault-backend/db"
)

func main() {

	var connString string
	var pool *pgxpool.Pool
	var err error
	var router *gin.Engine

	godotenv.Load("postgres.env")
	connString = os.Getenv("DATABASE_URL")

	if connString == "" {

		connString = "postgres://usuario:password@localhost:5432/gamevault"

	}

	pool, err = db.Connect(connString)

	if err != nil {

		log.Println("Aviso: no se pudo conectar a la base de datos:", err)

	}

	router = gin.Default()

	router.GET("/health", func(c *gin.Context) {

		if pool == nil {

			c.JSON(503, gin.H{

				"status":   "error",
				"database": "sin conexión",
			})

			return
		}

		c.JSON(200, gin.H{

			"status":   "ok",
			"database": "conectada",
		})

	})

	log.Println("Servidor escuchando en http://localhost:9000")
	err = router.Run(":9000")

	if err != nil {

		log.Fatalf("Error al arrancar el servidor: %v", err)

	}
}
