package model

import "time"

type Customer struct {
	ID        int       `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Phone     *string   `db:"phone" json:"phone"`
	IDNumber  *string   `db:"id_number" json:"id_number"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
