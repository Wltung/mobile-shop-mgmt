package service

import (
	"api/internal/model"
	"api/internal/repository"
	"fmt"
	"time"
)

type InvoiceService struct {
	Repo *repository.InvoiceRepo
}

func NewInvoiceService(repo *repository.InvoiceRepo) *InvoiceService {
	return &InvoiceService{Repo: repo}
}

func (s *InvoiceService) CreateInvoice(input model.CreateInvoiceInput, userID int) (int, error) {
	// 1. Tính toán items và tổng tiền
	var totalAmount float64
	var items []model.InvoiceItem

	for i, itemInput := range input.Items {
		if itemInput.ItemType == model.ItemTypePhone && itemInput.PhoneID == nil {
			return 0, fmt.Errorf("mục thứ %d: loại hàng là Điện thoại thì bắt buộc phải chọn máy (PhoneID)", i+1)
		}

		amount := float64(itemInput.Quantity) * itemInput.UnitPrice
		totalAmount += amount

		items = append(items, model.InvoiceItem{
			ItemType:       itemInput.ItemType,
			PhoneID:        itemInput.PhoneID,
			Description:    itemInput.Description,
			Quantity:       itemInput.Quantity,
			UnitPrice:      itemInput.UnitPrice,
			Amount:         amount,
			WarrantyMonths: itemInput.WarrantyMonths,
		})
	}

	// 2. Chuẩn bị Invoice Header
	status := input.Status
	if status == "" {
		status = model.InvoiceStatusPaid
	}

	invoice := model.Invoice{
		Type:        input.Type,
		Status:      status,
		CustomerID:  input.CustomerID,
		TotalAmount: totalAmount,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		Note:        input.Note,
	}

	// 3. Gọi Repo lưu
	return s.Repo.Create(invoice, items)
}

func (s *InvoiceService) GetInvoiceDetail(id int) (*model.Invoice, error) {
	return s.Repo.GetByID(id)
}
