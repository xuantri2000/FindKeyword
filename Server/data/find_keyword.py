import os
import datetime
import json

def search_in_files():
    """
    Tìm kiếm mảng từ khóa trong tất cả các tệp .txt trong thư mục hiện tại và các thư mục con.
    Kết quả được lưu vào file tự động đặt tên theo định dạng ngàythángnămgiờphútgiây.json.
    """
    # Mảng từ khóa cố định
    keywords = [
        "gov.kh",
    ]

    results = []
    current_time = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")  # Lấy thời gian hiện tại
    output_filename = datetime.datetime.now().strftime("%d%m%Y%H%M%S") + ".json"  # Định dạng tên file

    for root, _, files in os.walk(os.getcwd()):  # Duyệt đệ quy thư mục
        for file in files:
            if file.endswith('.txt'):  # Chỉ tìm trong tệp .txt
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_num, line in enumerate(f, start=1):
                            if any(keyword in line for keyword in keywords):  # Kiểm tra từng từ khóa
                                filename_only = f"{os.path.basename(file_path)}:{line_num}"  # Lấy tên file + số dòng
                                
                                # Tách nội dung theo dấu ":"
                                parts = line.strip().split(":")
                                
                                # Nếu có ít nhất 3 phần (URL + username + password)
                                if len(parts) >= 3:  
                                    url_path = ":".join(parts[:-2]).strip()  # Ghép lại các phần đầu làm URL
                                    username = parts[-2].strip()  # Username là phần kế cuối
                                    password = parts[-1].strip()  # Password là phần cuối
                                else:
                                    url_path = line.strip()  # Nếu không đủ phần tử, lấy toàn bộ dòng
                                    username = ""
                                    password = ""

                                # Tạo dictionary JSON
                                result = {
                                    "filename": filename_only,
                                    "url_path": url_path,
                                    "username": username,
                                    "password": password,
                                    "run_time": current_time
                                }

                                print(json.dumps(result, ensure_ascii=False, indent=2))  # Hiển thị dưới dạng JSON
                                results.append(result)
                except Exception as e:
                    print(f"Không thể đọc tệp: {file_path}. Lỗi: {e}")

    # Lưu kết quả vào tệp JSON tự động đặt tên theo thời gian
    if results:
        try:
            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"Kết quả đã được lưu vào: {output_filename}")
        except Exception as e:
            print(f"Không thể ghi vào tệp: {output_filename}. Lỗi: {e}")
    else:
        print("Không tìm thấy kết quả phù hợp.")

if __name__ == "__main__":
    search_in_files()
