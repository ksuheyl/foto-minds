import cv2
import numpy as np
from albumentations import (
    Compose, RandomBrightnessContrast,
    HorizontalFlip, RandomRotate90,
    GaussNoise, RandomGamma
)

def apply_augmentation(image):
    """Apply augmentation to training images"""
    transform = Compose([
        HorizontalFlip(p=0.5),
        RandomRotate90(p=0.2),
        RandomBrightnessContrast(p=0.2),
        GaussNoise(p=0.2),
        RandomGamma(p=0.2)
    ])
    
    return transform(image=image)['image']

def create_training_pair(image):
    """Create a pair of original and augmented images for training"""
    augmented = apply_augmentation(image)
    return image, augmented
