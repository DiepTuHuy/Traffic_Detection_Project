import edge_tts
import asyncio
import os

class TextToSpeechConverter:
    def __init__(self, voice="vi-VN-HoaiMyNeural"):
        self.voice = voice

    async def _convert_process(self, text, output_filename):
        try:
            print(f"Đang xử lý văn bản (độ dài: {len(text)} ký tự)...")
            
            communicate = edge_tts.Communicate(
                text, 
                self.voice, 
            )
            await communicate.save(output_filename)
            print(f"Thành công! File đã được lưu tại: {output_filename}")
            
        except Exception as e:
            print(f"Lỗi trong quá trình tạo file TTS: {e}")

    def convert_file(self, input_txt_path, output_mp3_path):
        if not os.path.exists(input_txt_path):
            print(f"Lỗi: Không tìm thấy file '{input_txt_path}'")
            return

        with open(input_txt_path, 'r', encoding='utf-8') as file:
            text = file.read().strip()

        if not text:
            print(f"Lỗi: File '{input_txt_path}' không có nội dung!")
            return

        asyncio.run(self._convert_process(text, output_mp3_path))

if __name__ == "__main__":
    tts = TextToSpeechConverter()
    
    file_vao = "input.txt"
    file_ra = "Cam re trai va quay dau.mp3"
    
    tts.convert_file(file_vao, file_ra)