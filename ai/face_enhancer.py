import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
import logging
import torch
import torch.nn as nn
from models.expression_net import ExpressionCorrectionNet
from utils.preprocessing import normalize_face, denormalize_face

logger = logging.getLogger(__name__)

class FaceEnhancer:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=10,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.expression_net = ExpressionCorrectionNet()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.expression_net.to(self.device)
        self._load_model_weights()

    def _load_model_weights(self):
        """Load pre-trained weights for the expression correction network"""
        try:
            model_path = 'c:/Users/Efe/Desktop/foto-minds/ai/model_weights.pth'
            self.expression_net.load_state_dict(torch.load(model_path, map_location=self.device))
            self.expression_net.eval()
            logger.info("Model weights loaded successfully.")
        except FileNotFoundError:
            logger.error(f"Model weights file not found at {model_path}. Please check the path.")
            raise
        except Exception as e:
            logger.error(f"Failed to load model weights: {e}")
            raise

    def process_image(self, image, censor=False):
        """Main entry point for face processing with censoring control"""
        try:
            if censor:
                return self._apply_censoring(image)
            else:
                return self.enhance_facial_features(image)
        except Exception as e:
            logger.error(f"Error in image processing: {str(e)}")
            raise

    def _apply_censoring(self, image):
        """Apply gray censoring to detected faces"""
        try:

            if isinstance(image, np.ndarray):
                image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
                
            img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            results = self.face_mesh.process(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))
            if results and results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    height, width = img_cv.shape[:2]

                    x_coordinates = [landmark.x * width for landmark in face_landmarks.landmark]
                    y_coordinates = [landmark.y * height for landmark in face_landmarks.landmark]
                    
                    x_min, x_max = int(min(x_coordinates)), int(max(x_coordinates))
                    y_min, y_max = int(min(y_coordinates)), int(max(y_coordinates))
                    
                    padding = 30
                    x_min = max(0, x_min - padding)
                    y_min = max(0, y_min - padding)
                    x_max = min(width, x_max + padding)
                    y_max = min(height, y_max + padding)
                    
                    img_cv[y_min:y_max, x_min:x_max] = 128
            
            return Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))
            
        except Exception as e:
            logger.error(f"Face censoring failed: {e}")
            return image

    def enhance_facial_features(self, image):
        """Enhance facial features in the image"""
        try:

            if isinstance(image, np.ndarray):
                image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            if len(img_cv.shape) != 3 or img_cv.shape[2] != 3:
                raise ValueError(f"Invalid input image format: {img_cv.shape}")
            
            results = self.face_mesh.process(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))
            if results and results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    face_region = self._extract_face_region(img_cv, face_landmarks)
                    if face_region is None:
                        continue
                    
                    normalized_face = normalize_face(face_region)
                    face_tensor = torch.from_numpy(normalized_face).float().to(self.device)
                    
                    with torch.no_grad():
                        corrected_face = self.expression_net(face_tensor.unsqueeze(0))
                    
                    corrected_face = corrected_face.squeeze(0).cpu().numpy()
                    corrected_face = denormalize_face(corrected_face)
                    
                    img_cv = self._blend_correction(img_cv, corrected_face, face_landmarks)
            
            return Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))
            
        except Exception as e:
            logger.error(f"Error in face enhancement: {str(e)}")
            raise

    def _extract_face_region(self, image, landmarks):
        """Extract face region using landmarks with proper channel handling"""
        try:
            if image is None or len(image.shape) != 3:
                logger.error(f"Invalid image format: shape={image.shape if image is not None else None}")
                return None

            height, width = image.shape[:2]
            
            x_coordinates = [landmark.x * width for landmark in landmarks.landmark]
            y_coordinates = [landmark.y * height for landmark in landmarks.landmark]
            
            x_min, x_max = int(min(x_coordinates)), int(max(x_coordinates))
            y_min, y_max = int(min(y_coordinates)), int(max(y_coordinates))
            
            padding = 30
            x_min = max(0, x_min - padding)
            y_min = max(0, y_min - padding)
            x_max = min(width, x_max + padding)
            y_max = min(height, y_max + padding)

            face_region = image[y_min:y_max, x_min:x_max]
            if face_region.shape[2] != 3:
                logger.error(f"Invalid number of channels in face region: {face_region.shape}")
                return None
                
            self.last_face_coords = (x_min, y_min, x_max, y_max)
            return cv2.resize(face_region, (256, 256))
            
        except Exception as e:
            logger.error(f"Face region extraction failed: {e}")
            return None

    def _blend_correction(self, original, corrected, landmarks):
        """Blend the corrected face back into the original image with proper channel handling"""
        try:
            if not hasattr(self, 'last_face_coords'):
                return original
                
            x_min, y_min, x_max, y_max = self.last_face_coords
            
            if len(original.shape) != 3 or len(corrected.shape) != 3:
                raise ValueError(f"Invalid image shapes: original={original.shape}, corrected={corrected.shape}")
            
            if corrected.shape[2] != 3:
                raise ValueError(f"Invalid number of channels in corrected image: {corrected.shape}")

            face_height = y_max - y_min
            face_width = x_max - x_min
            corrected = cv2.resize(corrected, (face_width, face_height))

            mask = np.ones((face_height, face_width), dtype=np.float32)
            mask = cv2.GaussianBlur(mask, (15, 15), 10)
            mask = np.dstack([mask] * 3) 
            
            result = original.copy()
            roi = result[y_min:y_max, x_min:x_max]
            blended = (mask * corrected + (1 - mask) * roi).astype(np.uint8)
            result[y_min:y_max, x_min:x_max] = blended
            
            return result
            
        except Exception as e:
            logger.error(f"Blending failed: {e}")
            return original

    def _enhance_eyes(self, image, landmarks):
        """Enhance eye region"""
        try:

            left_eye = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
            right_eye = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382]
            
            height, width = image.shape[:2]
            left_eye_region = np.array([(landmarks.landmark[i].x * width, landmarks.landmark[i].y * height) for i in left_eye], np.int32)
            right_eye_region = np.array([(landmarks.landmark[i].x * width, landmarks.landmark[i].y * height) for i in right_eye], np.int32)
            
            for eye_region in [left_eye_region, right_eye_region]:
                mask = np.zeros(image.shape[:2], dtype=np.uint8)
                cv2.fillPoly(mask, [eye_region], 255)

                eye_area = cv2.bitwise_and(image, image, mask=mask)
                enhanced = cv2.addWeighted(eye_area, 1.2, np.zeros_like(eye_area), 0, 5)
                image = cv2.add(cv2.bitwise_and(image, image, mask=cv2.bitwise_not(mask)), enhanced)
            
            return image
        
        except Exception as e:
            logger.warning(f"Eye enhancement failed: {e}")
            return image

    def _enhance_smile(self, image, landmarks, emotions):
        """Enhance smile region based on emotion"""
        try:

            lips = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
            
            height, width = image.shape[:2]
            lips_region = np.array([(landmarks.landmark[i].x * width, landmarks.landmark[i].y * height) for i in lips], np.int32)

            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            cv2.fillPoly(mask, [lips_region], 255)
            
            if emotions['happy'] > 50:
                enhanced = cv2.addWeighted(image, 1.3, np.zeros_like(image), 0, 5)
            else:
                enhanced = cv2.addWeighted(image, 1.1, np.zeros_like(image), 0, 3)
            
            return cv2.add(cv2.bitwise_and(image, image, mask=cv2.bitwise_not(mask)), 
                          cv2.bitwise_and(enhanced, enhanced, mask=mask))
        
        except Exception as e:
            logger.warning(f"Smile enhancement failed: {e}")
            return image

    def _enhance_skin(self, image, landmarks):
        """Enhance skin texture"""
        try:
            blur = cv2.GaussianBlur(image, (5, 5), 0)
            return cv2.addWeighted(image, 0.7, blur, 0.3, 0)
        
        except Exception as e:
            logger.warning(f"Skin enhancement failed: {e}")
            return image
