package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(connString string) (*pgxpool.Pool, error) {

	var pool *pgxpool.Pool
	var err error

	pool, err = pgxpool.New(context.Background(), connString)

	if err != nil {

		return nil, fmt.Errorf("Error al crear el pool de conexiones: %w", err)

	}

	err = pool.Ping(context.Background())

	if err != nil {

		return nil, fmt.Errorf("Error al conectar con la base de datos: %w", err)

	}

	return pool, nil
}
