import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models import resnet18
import numpy as np
from PIL import Image, ImageStat

class AestheticModel(nn.Module):
    def __init__(self):
        super(AestheticModel, self).__init__()
        self.resnet = resnet18(pretrained=True)
        self.resnet.conv1 = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)
        num_features = self.resnet.fc.in_features
        self.resnet.fc = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 1)
        )
        
    def forward(self, x):
        return self.resnet(x)

class AestheticAnalyzer:
    def __init__(self):
        self.model = AestheticModel()
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.Lambda(lambda x: x.convert('RGB')), 
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
        
    def analyze_composition(self, image):
        width, height = image.size
        aspect_ratio = width / height
        return {
            "aspect_ratio": round(aspect_ratio, 2),
            "follows_rule_of_thirds": self._check_rule_of_thirds(aspect_ratio)
        }
    
    def analyze_exposure(self, image):
        stat = ImageStat.Stat(image)
        brightness = sum(stat.mean) / len(stat.mean)
        return {
            "brightness": round(brightness, 2),
            "is_well_exposed": 80 < brightness < 180
        }

    def get_suggestions(self, composition_data, exposure_data):
        suggestions = []
        
        if not composition_data["follows_rule_of_thirds"]:
            suggestions.append("Consider recomposing using the rule of thirds")
        
        if exposure_data["brightness"] < 80:
            suggestions.append("Image appears underexposed. Consider increasing exposure")
        elif exposure_data["brightness"] > 180:
            suggestions.append("Image appears overexposed. Consider decreasing exposure")
            
        return suggestions

    def _check_rule_of_thirds(self, aspect_ratio):
        return 1.3 <= aspect_ratio <= 1.7
    
    def predict_score(self, image):
        try:
            img_tensor = self.transform(image).unsqueeze(0)
            
            with torch.no_grad():
                score = self.model(img_tensor)
                score = float(torch.sigmoid(score) * 10)
            
            return round(score, 1)
        except Exception as e:
            print(f"Error in predict_score: {str(e)}")
            return 5.0 
