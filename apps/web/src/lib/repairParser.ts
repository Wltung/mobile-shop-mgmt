// apps/web/src/lib/repairParser.ts
import { ParsedRepairData, RepairPart } from "@/types/repair"

// 1. HÀM BÓC TÁCH (Dùng cho Trang chi tiết và Form Edit)
export const parseRepairDescription = (
    description?: string | null,
    dbDeviceName?: string | null,
    dbPartCost?: number | null
): ParsedRepairData => {
    let mainError = ''
    let imei = '', color = '', accessories = '', appointmentDate = '', technicalNote = ''
    let deviceName = dbDeviceName || ''
    const parts: RepairPart[] = []
    let discount = '0'
    let hasLaborWarranty = false

    if (description) {
        const lines = description.split('\n')
        const errorLines: string[] = []

        lines.forEach((line) => {
            const tLine = line.trim()
            if (tLine.startsWith('- IMEI: ')) imei = tLine.replace('- IMEI: ', '').trim()
            else if (tLine.startsWith('- Màu: ')) color = tLine.replace('- Màu: ', '').trim()
            else if (tLine.startsWith('- Kèm theo: ')) accessories = tLine.replace('- Kèm theo: ', '').trim()
            else if (tLine.startsWith('- Hẹn trả: ')) appointmentDate = tLine.replace('- Hẹn trả: ', '').trim()
            else if (tLine.startsWith('- Kỹ thuật: ')) technicalNote = tLine.replace('- Kỹ thuật: ', '').trim()
            else if (tLine.startsWith('- Giảm giá: ')) discount = tLine.replace('- Giảm giá: ', '').trim()
            else if (tLine.startsWith('- Bảo hành tiền công: ')) hasLaborWarranty = tLine.replace('- Bảo hành tiền công: ', '').trim() === 'true'
            else if (tLine.startsWith('- Linh kiện: ')) {
                const partsArr = tLine.replace('- Linh kiện: ', '').split('|').map((s) => s.trim())
                parts.push({
                    name: partsArr[0] || 'Linh kiện',
                    price: Number(partsArr[1]) || 0,
                    warranty: Number(partsArr[2]) || 0,
                })
            } else {
                let cleanLine = tLine
                if (cleanLine.startsWith('[Máy ngoài: ')) {
                    const endIdx = cleanLine.indexOf(']')
                    if (endIdx !== -1) {
                        if (!deviceName || deviceName === '---') {
                            deviceName = cleanLine.substring(12, endIdx).trim()
                        }
                        cleanLine = cleanLine.substring(endIdx + 1).trim()
                    }
                }
                if (cleanLine) errorLines.push(cleanLine)
            }
        })
        mainError = errorLines.join('\n').trim()
    }

    // Tự sinh 1 dòng linh kiện nếu DB cũ có part_cost nhưng chưa có trong chuỗi
    if (parts.length === 0 && dbPartCost && dbPartCost > 0) {
        parts.push({ name: 'Linh kiện (Chưa rõ)', price: dbPartCost, warranty: 0 })
    }

    return {
        mainError,
        imei,
        color,
        accessories: accessories || 'Không có', // Default
        appointmentDate: appointmentDate || 'Chưa hẹn', // Default
        technicalNote,
        deviceName: deviceName || 'Không xác định', // Default
        parts,
        discount,          // Trả về discount
        hasLaborWarranty
    }
}

// 2. HÀM ĐÓNG GÓI (Dùng khi Submit form Create / Edit)
export const buildRepairDescription = (params: {
    mainError: string
    deviceName?: string
    isExternalDevice?: boolean // True nếu là máy khách lẻ mang tới
    imei?: string
    color?: string
    accessories?: string
    appointmentDate?: string // Định dạng Date HTML
    technicalNote?: string
    parts?: { name: string; price: string | number; warranty: string | number }[]
    discount?: string | number
    hasLaborWarranty?: boolean
}): string => {
    let finalDesc = params.mainError

    if (params.isExternalDevice && params.deviceName) {
        finalDesc = `[Máy ngoài: ${params.deviceName}]\n` + finalDesc
    }
    if (params.imei) finalDesc += `\n- IMEI: ${params.imei}`
    if (params.color) finalDesc += `\n- Màu: ${params.color}`
    if (params.accessories) finalDesc += `\n- Kèm theo: ${params.accessories}`
    
    if (params.appointmentDate) {
        const dateStr = new Date(params.appointmentDate).toLocaleString('vi-VN')
        finalDesc += `\n- Hẹn trả: ${dateStr}`
    }
    
    if (params.technicalNote) finalDesc += `\n- Kỹ thuật: ${params.technicalNote}`
    
    if (params.parts && params.parts.length > 0) {
        params.parts.forEach((p) => {
            finalDesc += `\n- Linh kiện: ${p.name} | ${p.price || 0} | ${p.warranty || 0}`
        })
    }
    if (params.discount && Number(params.discount) > 0) {
        finalDesc += `\n- Giảm giá: ${params.discount}`
    }
    if (params.hasLaborWarranty !== undefined) {
        finalDesc += `\n- Bảo hành tiền công: ${params.hasLaborWarranty}`
    }

    return finalDesc
}

export const parseViVNDateToInput = (viDateStr: string) => {
    if (!viDateStr || viDateStr === 'Chưa hẹn') return ''
    try {
        const [time, date] = viDateStr.split(' ')
        if (!time || !date) return ''
        const [h, m] = time.split(':')
        const [d, mo, y] = date.split('/')
        if (!h || !d || !mo || !y) return ''
        return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${m.padStart(2, '0')}`
    } catch { return '' }
}