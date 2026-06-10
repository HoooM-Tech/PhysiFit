import os
from PIL import Image

def main():
    img_path = "public/images/logo.png"
    out_path = "public/images/logo_dark.png"
    
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return
        
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # If it's close to white, make it fully transparent
        if r > 240 and g > 240 and b > 240:
            new_data.append((0, 0, 0, 0))
        else:
            # Convert the colored/dark parts to clean white text
            new_data.append((255, 255, 255, a))
            
    img.putdata(new_data)
    
    # Crop to the exact bounding box of the non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(out_path, "PNG")
    print("Success: processed and closely cropped dark mode logo.")

if __name__ == "__main__":
    main()
