module.exports.handleFileError = (filename, error) => {
    if (error.code === "ENOENT") {
        return `⚠️ Tệp ${filename} không tồn tại.`;
    } 
    if (error instanceof SyntaxError) {
        return `⚠️ Tệp ${filename} chứa chuỗi JSON không hợp lệ.`;
    }
    return `❌ Thêm danh sách tài khoản cho file ${filename} thất bại.`;
    // return `❌ Thêm danh sách tài khoản cho file ${filename} thất bại: ${error.message}`;
};