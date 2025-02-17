import os
import json
import random
import string
from datetime import datetime

# Lấy thư mục hiện tại của file Python
current_dir = os.getcwd()
file1_path = os.path.join(current_dir, "generated_records_4.json")

# Hàm tạo username ngẫu nhiên
def generate_username():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

# Hàm tạo password ngẫu nhiên
def generate_password():
    return ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=10))

# Tạo và ghi dữ liệu JSON theo từng phần để tránh lỗi bộ nhớ
num_records = 1_000_000  # 1 triệu records
chunk_size = 50_000  # Ghi từng phần

with open(file1_path, "w", encoding="utf-8") as f:
    f.write("[\n")  # Bắt đầu JSON array
    
    for chunk_start in range(0, num_records, chunk_size):
        records_chunk = []
        for i in range(chunk_size):
            username = generate_username()
            password = generate_password()
            record = {
                "filename": f"record_{chunk_start + i + 1}.txt",
                "url_path": "https://example.com/login",
                "username": username,
                "password": password,
                "run_time": datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            }
            records_chunk.append(record)
        
        json.dump(records_chunk, f, indent=4)
        if chunk_start + chunk_size < num_records:
            f.write(",\n")  # Thêm dấu phẩy giữa các chunk

    f.write("\n]")  # Kết thúc JSON array

print(f"File JSON đã được tạo tại: {file1_path}")
