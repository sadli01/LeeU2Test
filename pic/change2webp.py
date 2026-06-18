
import cv2 #3.10.18
import os
from PIL import Image
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIC_SUPPORT = True
except ImportError:
    HEIC_SUPPORT = False
    print("警告: pillow-heif 未安装，HEIC 格式将无法处理。请运行: pip install pillow-heif")

# 指定目录
input_dir = '/Users/yuli/code_proj/code/LeeU2/LeeU2Test/pic/portrait/LFY'
output_dir = '/Users/yuli/code_proj/code/LeeU2/LeeU2Test/pic/portrait/LFY'
proj_name = 'portrait_'

# 遍历目录中的所有文件
for filename in os.listdir(input_dir):
    filename_lower = filename.lower()
    
    # 处理 JPG/JPEG 格式
    if filename_lower.endswith('.jpg') or filename_lower.endswith('.jpeg'):
        input_file = os.path.join(input_dir, filename)
        output_file = os.path.join(output_dir, f"{os.path.splitext(filename)[0]}.webp")

        # 使用 OpenCV 转换为 WEBP 格式
        try:
            img = cv2.imread(input_file)
            cv2.imwrite(output_file, img)
            print(f'Converted {input_file} to {output_file}')

            # 删除原来的 jpg 文件（可选）
            os.remove(input_file)
            print(f'Removed original file {input_file}')

        except Exception as e:
            print(f"无法处理文件 {input_file}: {e}")
    
    # 处理 HEIC 格式
    elif filename_lower.endswith('.heic') or filename_lower.endswith('.heif'):
        if not HEIC_SUPPORT:
            print(f"跳过 {filename}: HEIC 支持未启用，请安装 pillow-heif")
            continue
            
        input_file = os.path.join(input_dir, filename)
        output_file = os.path.join(output_dir, f"{os.path.splitext(filename)[0]}.webp")

        # 使用 PIL/Pillow 转换为 WEBP 格式
        try:
            img = Image.open(input_file)
            # 转换为 RGB 模式（HEIC 可能是其他模式）
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output_file, 'WEBP', quality=100)
            print(f'Converted {input_file} to {output_file}')

            # 删除原来的 heic 文件（可选）
            os.remove(input_file)
            print(f'Removed original file {input_file}')

        except Exception as e:
            print(f"无法处理文件 {input_file}: {e}")

# =========================
# 给所有 .webp 文件加前缀
# =========================

for filename in os.listdir(output_dir):
    if filename.lower().endswith('.webp'):
        # 如果已经有前缀则跳过，避免重复加
        if filename.startswith(f"{proj_name}_"):
            continue

        old_path = os.path.join(output_dir, filename)
        new_filename = f"{proj_name}{filename}"
        new_path = os.path.join(output_dir, new_filename)

        if not os.path.exists(new_path):
            os.rename(old_path, new_path)
            print(f"Renamed {filename} -> {new_filename}")
        else:
            print(f"Skipped (target exists): {new_filename}")