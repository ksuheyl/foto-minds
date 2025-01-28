import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import numpy as np
import cv2

class AIImageEnhancer:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.enhancement_model = self._load_enhancement_model()
        
    def _load_enhancement_model(self):
        model = models.vgg16(pretrained=True).features[:23].eval().to(self.device)
        for param in model.parameters():
            param.requires_grad = False
        return model

    def _enhance_colors(self, img):
        img_np = np.array(img)
        lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)

        a = cv2.normalize(a, None, 0, 255, cv2.NORM_MINMAX)
        b = cv2.normalize(b, None, 0, 255, cv2.NORM_MINMAX)
        enhanced_lab = cv2.merge((l, a, b))
        enhanced_rgb = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)
        return Image.fromarray(enhanced_rgb)

    def _apply_smart_sharpen(self, img):
        img_np = np.array(img)
        
        kernel = np.array([[-1,-1,-1],
                          [-1, 9,-1],
                          [-1,-1,-1]]) / 9
        
        sharpened = cv2.filter2D(img_np, -1, kernel)
        
        enhanced = cv2.addWeighted(img_np, 0.7, sharpened, 0.3, 0)
        return Image.fromarray(enhanced)

    def _enhance_details(self, img):
        img_np = np.array(img).astype(float)
        
        scales = [3, 5, 7]
        weights = [0.5, 0.3, 0.2]
        enhanced = np.zeros_like(img_np)
        
        for scale, weight in zip(scales, weights):
            blurred = cv2.GaussianBlur(img_np, (scale, scale), 0)
            detail = img_np - blurred
            enhanced += weight * detail
            
        enhanced = img_np + enhanced * 0.5
        enhanced = np.clip(enhanced, 0, 255).astype(np.uint8)
        return Image.fromarray(enhanced)

    def _increase_resolution(self, img, scale_factor=2.0):
        """Increase image resolution with detail preservation"""
        # Calculate new dimensions
        width, height = img.size
        new_width = int(width * scale_factor)
        new_height = int(height * scale_factor)
        
        # Initial high-quality upscale
        img_upscaled = img.resize((new_width, new_height), Image.LANCZOS)
        
        # Convert to numpy for processing
        img_np = np.array(img_upscaled)
        
        # Apply edge-preserving smoothing
        img_smooth = cv2.edgePreservingFilter(img_np, 
                                            flags=cv2.RECURS_FILTER,
                                            sigma_s=60,
                                            sigma_r=0.4)
        
        # Enhance details
        detail_enhanced = cv2.detailEnhance(img_smooth,
                                          sigma_s=20,
                                          sigma_r=0.15)
        
        # Apply sharpening
        kernel = np.array([[-1,-1,-1],
                          [-1, 9,-1],
                          [-1,-1,-1]]) / 9
        sharpened = cv2.filter2D(detail_enhanced, -1, kernel)
        
        return Image.fromarray(sharpened)

    def enhance(self, image, strength=1.0, preserve_tone=True, upscale=True):
        """
        Enhanced version with resolution upscaling
        """
        image = image.convert('RGB')
        original = image.copy()
        
        # Determine if upscaling is needed
        min_dimension = 1500  # Minimum target dimension
        current_min_dim = min(image.size)
        
        if upscale and current_min_dim < min_dimension:
            # Calculate scale factor
            scale_factor = min(min_dimension / current_min_dim, 2.0)
            if scale_factor > 1.2:  # Only upscale if significant
                image = self._increase_resolution(image, scale_factor)
                original = image.copy()  # Update original for later blending
        
        # Apply regular enhancements
        enhanced = self._enhance_colors(image)
        enhanced = self._enhance_details(enhanced)
        enhanced = self._apply_smart_sharpen(enhanced)
        
        # Color adjustments
        enhancer = ImageEnhance.Color(enhanced)
        enhanced = enhancer.enhance(1.2)
        enhancer = ImageEnhance.Contrast(enhanced)
        enhanced = enhancer.enhance(1.1)
        enhancer = ImageEnhance.Brightness(enhanced)
        enhanced = enhancer.enhance(1.05)
        
        # Final sharpening
        enhanced = enhanced.filter(
            ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3)
        )
        
        # Tone preservation
        if preserve_tone:
            blend_factor = min(max(strength * 0.8, 0.3), 0.9)
            enhanced = Image.blend(original, enhanced, blend_factor)
        
        return enhanced
