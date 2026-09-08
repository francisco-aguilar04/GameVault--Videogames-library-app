package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Connect creates a connection pool to PostgreSQL with the received connection string,
// and then verifies with a Ping that the db is working
func Connect(connString string) (*pgxpool.Pool, error) {
	var pool *pgxpool.Pool
	var err error

	// pgxpool.New prepares the pool without guarantees that it works
	pool, err = pgxpool.New(context.Background(), connString)
	if err != nil {
		return nil, fmt.Errorf("Error creating connection pool: %w", err)
	}

	// Ping verifies the PostgreSQL server is working
	err = pool.Ping(context.Background())
	if err != nil {
		return nil, fmt.Errorf("Error connecting to the database: %w", err)
	}

	return pool, nil
}
