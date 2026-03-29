/**
 * Định dạng số tiền sang chuẩn Vietnamese đồng (VNĐ)
 * Ví dụ: 100000 -> 100,000 VNĐ
 */
export const formatCurrency = (amount) => {
    if (amount === 0) return "MIỄN PHÍ";
    if (!amount) return "0 VNĐ";

    // Sử dụng Intl.NumberFormat để tự động thêm dấu phẩy ngăn cách hàng nghìn
    const formatter = new Intl.NumberFormat('en-US');
    return `${formatter.format(amount)} VNĐ`;
};
