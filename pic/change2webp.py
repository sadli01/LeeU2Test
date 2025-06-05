from PIL import Image
import os
from PIL.ExifTags import TAGS, GPSTAGS

# 指定目录
input_dir = 'pic/'
output_dir = 'pic/'

# 获取图像方向
def get_image_orientation(img):
    try:
        for orientation in img._getexif():
            if TAGS.get(orientation) == 'Orientation':
                return img._getexif()[orientation]
    except (AttributeError, KeyError, IndexError):
        return None
    return None

# 遍历目录中的所有文件
for filename in os.listdir(input_dir):
    if filename.lower().endswith('.jpg') or filename.lower().endswith('.jpeg'):
        input_file = os.path.join(input_dir, filename)
        output_file = os.path.join(output_dir, f"{os.path.splitext(filename)[0]}.webp")

        # 转换为 WEBP 格式
        with Image.open(input_file) as img:
            # 获取图像方向
            orientation = get_image_orientation(img)

            # 根据方向旋转图像
            if orientation == 3:
                img = img.rotate(180, expand=True)
            elif orientation == 6:
                img = img.rotate(270, expand=True)
            elif orientation == 8:
                img = img.rotate(90, expand=True)

            # 保持原始大小和角度
            img = img.convert("RGBA")  # 确保图像为 RGBA 格式
            img.save(output_file, 'WEBP', quality=100)  # 设置质量为 100

        # 删除原来的 jpg 文件（可选）
        # os.remove(input_file)

        print(f'Converted {input_file} to {output_file} and removed the original file')

       
