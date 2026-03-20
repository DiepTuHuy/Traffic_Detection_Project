import edge_tts
import asyncio
import os

# Nếu bạn vẫn dùng module log của mình, hãy bỏ comment dòng dưới
# from utils import log 

class TextToSpeechConverter:
    def __init__(self, voice="vi-VN-HoaiMyNeural"):
        """
        Khởi tạo các thông số giọng đọc. 
        Mặc định sử dụng giọng Hoài My, tốc độ nhanh hơn 20% và pitch cao hơn 50Hz (Cute).
        """
        self.voice = voice

    async def _convert_process(self, text, output_filename):
        """Tiến trình bất đồng bộ để gọi API của edge-tts và lưu file"""
        try:
            print(f"Đang xử lý văn bản (độ dài: {len(text)} ký tự)...")
            # Nếu dùng file utils.log, bạn thay print bằng: log("TTS", f"Đang xử lý...")
            
            communicate = edge_tts.Communicate(
                text, 
                self.voice, 
            )
            await communicate.save(output_filename)
            print(f"Thành công! File đã được lưu tại: {output_filename}")
            
        except Exception as e:
            print(f"Lỗi trong quá trình tạo file TTS: {e}")

    def convert_file(self, input_txt_path, output_mp3_path):
        """
        Hàm chính để người dùng gọi: 
        Đọc text từ file .txt và xuất ra file .mp3 theo tên chỉ định
        """
        # Kiểm tra xem file input có tồn tại không
        if not os.path.exists(input_txt_path):
            print(f"Lỗi: Không tìm thấy file '{input_txt_path}'")
            return

        # Đọc nội dung file văn bản
        with open(input_txt_path, 'r', encoding='utf-8') as file:
            text = file.read().strip()

        # Kiểm tra file có trống không
        if not text:
            print(f"Lỗi: File '{input_txt_path}' không có nội dung!")
            return

        # Khởi chạy vòng lặp bất đồng bộ để lưu file
        asyncio.run(self._convert_process(text, output_mp3_path))

# ==========================================
# CÁCH SỬ DỤNG
# ==========================================
if __name__ == "__main__":
    # 1. Tạo một file tên là 'input.txt' và viết gì đó vào đó để test nhé.
    # 2. Khởi tạo class
    tts = TextToSpeechConverter()
    
    # 3. Chỉ định tên file input và output bạn muốn
    file_vao = "input.txt"
    file_ra = "Cam re trai va quay dau.mp3"
    
    # 4. Chạy chuyển đổi
    tts.convert_file(file_vao, file_ra)