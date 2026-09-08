package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"gamevault-backend/main/models"
	"gamevault-backend/main/repository"
	"gamevault-backend/main/service"
)

func CreateWishlistItemHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input models.WishlistItem
		var err error

		err = c.ShouldBindJSON(&input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
			return
		}

		var item models.WishlistItem
		item, err = service.CreateWishlistItem(pool, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, item)
	}
}

func GetAllWishlistItemsHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var items, err = repository.GetAllWishlistItems(pool)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, items)
	}
}

func GetWishlistItemHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		var item models.WishlistItem
		item, err = repository.GetWishlistItemByID(pool, id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "item no encontrado"})
			return
		}

		c.JSON(http.StatusOK, item)
	}
}

func UpdateWishlistItemHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		var input models.WishlistItem
		err = c.ShouldBindJSON(&input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
			return
		}

		var item models.WishlistItem
		item, err = service.UpdateWishlistItem(pool, id, input)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "item no encontrado"})
			return
		}

		c.JSON(http.StatusOK, item)
	}
}

func DeleteWishlistItemHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		err = repository.DeleteWishlistItem(pool, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusNoContent)
	}
}

func MoveToLibraryHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var id int
		var err error

		id, err = strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		var game models.Game
		game, err = service.MoveToLibrary(pool, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, game)
	}
}

func GetWishlistItemsByTitleHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var title string
		var items []models.WishlistItem
		var err error

		title = c.Param("title")

		items, err = repository.GetWishlistItemsByTitle(pool, title)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if items == nil {
			items = []models.WishlistItem{}
		}

		c.JSON(http.StatusOK, items)
	}
}

func GetWishlistItemsByPlatformHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var platformID int
		var err error

		platformID, err = strconv.Atoi(c.Param("platformId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		var items []models.WishlistItem
		items, err = repository.GetWishlistItemsByPlatform(pool, platformID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if items == nil {
			items = []models.WishlistItem{}
		}

		c.JSON(http.StatusOK, items)
	}
}

func GetWishlistItemsByGenreHandler(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var genreID int
		var err error

		genreID, err = strconv.Atoi(c.Param("genreId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
			return
		}

		var items []models.WishlistItem
		items, err = repository.GetWishlistItemsByGenre(pool, genreID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if items == nil {
			items = []models.WishlistItem{}
		}

		c.JSON(http.StatusOK, items)
	}
}
