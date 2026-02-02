package repository

import (
	"api/internal/model"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type CustomerRepo struct {
	DB *sqlx.DB
}

func NewCustomerRepo(db *sqlx.DB) *CustomerRepo {
	return &CustomerRepo{DB: db}
}

// GetOrCreate: Triển khai logic định danh và khởi tạo
func (r *CustomerRepo) GetOrCreate(input model.CustomerIdentityInput) (int, error) {
	// 1. Validate sơ bộ: Nếu không có tên, không thể định danh -> trả về 0 (Khách lẻ)
	if input.Name == "" {
		return 0, nil
	}

	// 2. BƯỚC 1: KIỂM TRA (CHECK)
	// Tìm bản ghi có Name khớp VÀ (Phone khớp HOẶC ID_Number khớp)
	var existingCust model.Customer
	queryCheck := `
		SELECT id, name, phone, id_number 
		FROM customers 
		WHERE name = ? AND (
			(phone IS NOT NULL AND phone = ?) OR 
			(id_number IS NOT NULL AND id_number = ?)
		) LIMIT 1
	`
	// Lưu ý: Nếu input.Phone rỗng, query vẫn an toàn vì 'phone = ""' sẽ không khớp NULL
	err := r.DB.Get(&existingCust, queryCheck, input.Name, input.Phone, input.IDNumber)

	// 3. BƯỚC 2: QUYẾT ĐỊNH (DECISION)
	if err == nil {
		// A. TRƯỜNG HỢP TÌM THẤY -> Trả về ID hiện có
		// Đồng thời chạy logic "Làm giàu dữ liệu" (Update Động)
		go r.enrichCustomerData(existingCust, input)
		return existingCust.ID, nil
	}

	if err == sql.ErrNoRows {
		// B. TRƯỜNG HỢP KHÔNG THẤY
		// Kiểm tra điều kiện đủ thông tin để tạo mới: Name + (Phone OR IDNumber)
		hasContact := input.Phone != "" || input.IDNumber != ""

		if hasContact {
			// Tạo mới (INSERT)
			queryInsert := `INSERT INTO customers (name, phone, id_number) VALUES (?, ?, ?)`

			// Xử lý Null cho Phone/IDNumber khi insert
			var phonePtr, idPtr *string
			if input.Phone != "" {
				phonePtr = &input.Phone
			}
			if input.IDNumber != "" {
				idPtr = &input.IDNumber
			}

			res, err := r.DB.Exec(queryInsert, input.Name, phonePtr, idPtr)
			if err != nil {
				return 0, err
			}
			id, _ := res.LastInsertId()
			return int(id), nil
		}

		// Không đủ thông tin (chỉ có Tên hoặc trống hết) -> Coi là Khách vãng lai
		return 0, nil
	}

	return 0, err
}

// enrichCustomerData: Logic Update Động (Bổ sung thông tin)
// Hàm này private, chỉ gọi nội bộ khi tìm thấy khách cũ
func (r *CustomerRepo) enrichCustomerData(current model.Customer, input model.CustomerIdentityInput) {
	shouldUpdate := false

	// Prepare pointers for update
	newPhone := current.Phone
	newID := current.IDNumber

	// Quy tắc bổ sung Phone: Chỉ update khi DB đang trống và Input có dữ liệu
	if (current.Phone == nil || *current.Phone == "") && input.Phone != "" {
		newPhone = &input.Phone
		shouldUpdate = true
	}

	// Quy tắc bổ sung ID_Number: Chỉ update khi DB đang trống và Input có dữ liệu
	if (current.IDNumber == nil || *current.IDNumber == "") && input.IDNumber != "" {
		newID = &input.IDNumber
		shouldUpdate = true
	}

	// Ràng buộc toàn vẹn: Không ghi đè dữ liệu đã có
	if shouldUpdate {
		queryUpdate := `UPDATE customers SET phone = ?, id_number = ?, updated_at = NOW() WHERE id = ?`
		_, _ = r.DB.Exec(queryUpdate, newPhone, newID, current.ID)
	}
}
