import cv2  # 3.10.18
import os
from PIL import Image

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIC_SUPPORT = True
except ImportError:
    HEIC_SUPPORT = False
    print("警告: pillow-heif 未安装，HEIC 格式将无法处理。请运行: pip install pillow-heif")

# # 指定目录
# input_dir = 'pic/photo/photo4_hannah_yellowStone/'
# output_dir = 'pic/photo/photo4_hannah_yellowStone/'
input_dir = 'pic/photo/photo4_hannah_yellowStone/photo4_1/'
output_dir = 'pic/photo/photo4_hannah_yellowStone/photo4_1/'

proj_name = 'photo'

for filename in os.listdir(input_dir):
    filename_lower = filename.lower()
    name_without_ext = os.path.splitext(filename)[0]

    # 构造统一的输出 webp 文件名（直接加前缀）
    output_filename = f"{proj_name}{name_without_ext}.webp"
    output_file = os.path.join(output_dir, output_filename)
    input_file = os.path.join(input_dir, filename)

    # JPG / JPEG
    if filename_lower.endswith(('.jpg', '.jpeg')):
        try:
            img = cv2.imread(input_file)
            cv2.imwrite(output_file, img)
            print(f'Converted {input_file} -> {output_file}')

            os.remove(input_file)
            print(f'Removed original file {input_file}')

        except Exception as e:
            print(f"无法处理文件 {input_file}: {e}")

    # HEIC / HEIF
    elif filename_lower.endswith(('.heic', '.heif')):
        if not HEIC_SUPPORT:
            print(f"跳过 {filename}: HEIC 支持未启用")
            continue

        try:
            img = Image.open(input_file)
            if img.mode != 'RGB':
                img = img.convert('RGB')

            img.save(output_file, 'WEBP', quality=100)
            print(f'Converted {input_file} -> {output_file}')

            os.remove(input_file)
            print(f'Removed original file {input_file}')

        except Exception as e:
            print(f"无法处理文件 {input_file}: {e}")
