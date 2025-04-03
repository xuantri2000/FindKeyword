module.exports.handleFileError = (filename, error) => {
    if (error.code === "ENOENT") {
        return `⚠️ Tệp ${filename} không tồn tại.`;
    } 
    if (error instanceof SyntaxError) {
        return `⚠️ Tệp ${filename} chứa chuỗi JSON không hợp lệ.`;
    }
    return `❌ Thêm danh sách tài khoản cho file ${filename} thất bại.`;
};

module.exports.handleValidationError = (error) => {
    if (error.code === 11000) {
        return `Dữ liệu đầu vào bị trùng, vui lòng kiểm tra lại.`;
    } 
	if (error.name === "ValidationError") {
        return `Thiếu thông tin cần thiết, vui lòng kiểm tra lại.`;
    }
	if (error.name === "CastError") {
        return `Dữ liệu đầu vào không tồn tại hoặc đã bị xóa, vui lòng kiểm tra lại.`;
    }
    return `Đã xảy ra lỗi trong quá trình thao tác, vui lòng kiểm tra lại.`;
};