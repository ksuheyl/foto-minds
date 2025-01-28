import cv2
import numpy as np

def normalize_face(image):
    """Normalize face image for the neural network"""
    if image is None:
        raise ValueError("Input image is None")
        
    if len(image.shape) != 3:
        raise ValueError(f"Invalid image shape: {image.shape}")
        
    # Convert to float32
    image = image.astype(np.float32) / 255.0
    
    # Normalize to [-1, 1]
    image = (image - 0.5) * 2
    
    # Convert to channel-first format
    return image.transpose(2, 0, 1)

def denormalize_face(image):
    """Denormalize face image from network output"""
    if image is None:
        raise ValueError("Input image is None")
        
    # Convert back to channel-last format
    image = image.transpose(1, 2, 0)
    
    # Denormalize from [-1, 1] to [0, 1]
    image = (image / 2) + 0.5
    
    # Convert to uint8
    image = (image * 255).clip(0, 255).astype(np.uint8)
    
    return image

def apply_histogram_equalization(image):
    """Apply adaptive histogram equalization"""
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    lab = cv2.merge((l,a,b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
