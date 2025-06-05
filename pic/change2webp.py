from PIL import Image
import os

# 指定目录
input_dir = 'pic/'
output_dir = 'pic/'

# 遍历目录中的所有文件
for filename in os.listdir(input_dir):
    if filename.lower().endswith('.jpg') or filename.lower().endswith('.jpeg'):
        input_file = os.path.join(input_dir, filename)
        output_file = os.path.join(output_dir, f"{os.path.splitext(filename)[0]}.webp")

        # 转换为 WEBP 格式
        with Image.open(input_file) as img:
            img.save(output_file, 'WEBP')

        # 删除原来的jpg文件
        os.remove(input_file)

        print(f'Converted {input_file} to {output_file} and removed the original file')

       
