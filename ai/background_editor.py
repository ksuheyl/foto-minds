import logging
import os
from PIL import Image, ImageDraw 
import numpy as np
import cv2
from ultralytics import YOLO
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError as e:
    logger.warning(f"rembg import failed: {e}. Background removal will not be available.")
    REMBG_AVAILABLE = False

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
    pytesseract.get_tesseract_version()
except (ImportError, EnvironmentError) as e:
    logger.warning(f"Tesseract is not properly configured: {e}")
    TESSERACT_AVAILABLE = False

class BackgroundEditor:
    def __init__(self):
        self.backgrounds_dir = os.path.join(os.path.dirname(__file__), "..", "server", "uploads")
        if not os.path.exists(self.backgrounds_dir):
            logger.warning(f"Backgrounds directory not found: {self.backgrounds_dir}")
        
        if not REMBG_AVAILABLE:
            logger.warning("BackgroundEditor initialized without rembg support")
        
        try:
            self.yolo_model = YOLO('yolov8n.pt')
            self.YOLO_AVAILABLE = True
        except Exception as e:
            logger.warning(f"YOLO initialization failed: {e}")
            self.YOLO_AVAILABLE = False

    def detect_elements(self, image):
        """Detect text, people, and animals in the image"""
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        elements = {
            'text': [],
            'people': [],
            'animals': []
        }
        
        if TESSERACT_AVAILABLE:
            try:
                text_data = pytesseract.image_to_data(img_cv, output_type=pytesseract.Output.DICT)
                for i, text in enumerate(text_data['text']):
                    if text.strip():
                        x = text_data['left'][i]
                        y = text_data['top'][i]
                        w = text_data['width'][i]
                        h = text_data['height'][i]
                        elements['text'].append((x, y, x+w, y+h))
            except Exception as e:
                logger.warning(f"Text detection failed: {e}")

        if self.YOLO_AVAILABLE:
            try:
                results = self.yolo_model(img_cv)
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        try:
                            cls = int(box.cls[0].item()) 
                            coords = box.xyxy[0].cpu().numpy().flatten()
                            if cls == 0:
                                elements['people'].append(coords.tolist())
                            elif cls in [15, 16, 17, 18, 19, 20, 21, 22]: 
                                elements['animals'].append(coords.tolist())
                        except Exception as e:
                            logger.warning(f"Error processing YOLO detection box: {e}")
                            continue
            except Exception as e:
                logger.warning(f"YOLO detection failed: {e}")

        return elements

    def select_focus_element(self, elements):
        """Select which element to focus on for background removal"""
        try:
            if elements['people']:
                selected = np.array(elements['people'][random.randint(0, len(elements['people']) - 1)]).flatten()
                return ('people', selected)
            elif elements['animals']:
                selected = np.array(elements['animals'][0]).flatten()
                return ('animals', selected)
            elif elements['text']:
                merged = self._merge_text_boxes(elements['text'])
                if merged is not None:
                    return ('text', np.array(merged).flatten())
            return None
        except Exception as e:
            logger.warning(f"Error in select_focus_element: {e}")
            return None

    def _merge_text_boxes(self, text_boxes):
        """Merge nearby text boxes into a single region"""
        if not text_boxes or len(text_boxes) == 0:
            return None
        
        try:
            boxes = np.array(text_boxes)
            x_min = float(np.min(boxes[:, 0]))
            y_min = float(np.min(boxes[:, 1]))
            x_max = float(np.max(boxes[:, 2]))
            y_max = float(np.max(boxes[:, 3]))
            
            padding = 10
            return [x_min-padding, y_min-padding, x_max+padding, y_max+padding]
        except Exception as e:
            logger.warning(f"Error merging text boxes: {e}")
            return None

    def create_multiple_person_mask(self, image_size, people_coords, padding=20):
        """Create a mask that includes all detected people"""
        mask = Image.new('L', image_size, 0)
        mask_draw = ImageDraw.Draw(mask)
        
        width, height = image_size
        for coords in people_coords:
            x1 = max(0, int(round(float(coords[0]))) - padding)
            y1 = max(0, int(round(float(coords[1]))) - padding)
            x2 = min(width, int(round(float(coords[2]))) + padding)
            y2 = min(height, int(round(float(coords[3]))) + padding)
            mask_draw.rectangle([x1, y1, x2, y2], fill=255)
        
        return mask

    def remove_background(self, image):
        """Enhanced background removal keeping all detected persons"""
        if not REMBG_AVAILABLE:
            raise RuntimeError("rembg is not available")

        try:
           
            full_removed = remove(image)
            elements = self.detect_elements(image)
            
            if elements['people']:
                try:
                    mask = self.create_multiple_person_mask(image.size, elements['people'])
                    
                    result = Image.new('RGBA', image.size, (0, 0, 0, 0))
                    
                    removed_bg = remove(image)
                    
                    result.paste(removed_bg, mask=mask)
                    
                    return result
                except Exception as e:
                    logger.warning(f"Multiple person removal failed, using full removal: {e}")
                    return full_removed
            
            return full_removed

        except Exception as e:
            logger.error(f"Error in enhanced background removal: {str(e)}")
            raise

    def replace_background(self, image, background_name):
        """Replace background with a new one"""
        try:

            img_without_bg = self.remove_background(image)
            

            bg_path = os.path.join(self.backgrounds_dir, background_name)
            logger.info(f"Looking for background at: {bg_path}")
            
            if not os.path.exists(bg_path):
                raise FileNotFoundError(f"Background {background_name} not found at {bg_path}")
            
            background = Image.open(bg_path).convert('RGBA')
            background = background.resize(image.size, Image.LANCZOS)
            
            return Image.alpha_composite(background, img_without_bg)
            
        except Exception as e:
            logger.error(f"Error replacing background: {str(e)}")
            raise

    def list_available_backgrounds(self):
        """List all available background images"""
        try:
            return [f for f in os.listdir(self.backgrounds_dir) 
                   if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        except Exception as e:
            logger.error(f"Error listing backgrounds: {str(e)}")
            return []

