import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VanGoghStyleTransfer:
    def __init__(self):
        try:
            self.device = torch.device("cpu") 
            logger.info(f"Using device: {self.device}")

            self.transform = transforms.Compose([
                transforms.Resize((300, 300)), 
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

            self.model = models.vgg19(pretrained=True).features.to(self.device).eval()


            self.style_layers_idx = [0, 5, 10, 19, 28]
            self.content_layers_idx = [21]            

            style_path = os.path.join(os.path.dirname(__file__), "assets", "vangogh_starry_night.jpg")
            if not os.path.exists(style_path):
                raise FileNotFoundError(f"Style image not found at {style_path}")

            self.style_features = self.get_style_features(style_path)
            logger.info("Style transfer model initialized successfully")

        except Exception as e:
            logger.error(f"Error initializing VanGoghStyleTransfer: {str(e)}")
            raise

    def get_features(self, x):
        features = {}
        for i, layer in enumerate(self.model):
            x = layer(x)
            if i in self.style_layers_idx:
                features[str(i)] = x
            if i in self.content_layers_idx:
                features[str(i)] = x
        return features

    def get_style_features(self, style_path):
        try:
            style_img = Image.open(style_path).convert('RGB')
            style_tensor = self.transform(style_img).unsqueeze(0).to(self.device)

            features = self.get_features(style_tensor)
            return {k: self.gram_matrix(v) for k, v in features.items()}

        except Exception as e:
            logger.error(f"Error loading style image: {str(e)}")
            raise

    def transfer_style(self, content_image):
        try:
            logger.info("Starting style transfer process")

            if content_image.mode != 'RGB':
                content_image = content_image.convert('RGB')
            original_size = content_image.size
            
            content_tensor = self.transform(content_image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                content_features = self.get_features(content_tensor)

            output = content_tensor.clone().requires_grad_(True)
            
            optimizer = torch.optim.Adam([output], lr=0.01)
            num_steps = 100  
            
            style_weight = 1e6
            content_weight = 1

            for step in range(num_steps):
                def closure():
                    optimizer.zero_grad()
                    
                    output_features = self.get_features(output)
                    
                    style_loss = 0
                    for idx in self.style_layers_idx:
                        key = str(idx)
                        gram_output = self.gram_matrix(output_features[key])
                        gram_style = self.style_features[key]
                        style_loss += torch.mean((gram_output - gram_style)**2)

                    content_loss = sum(torch.mean((output_features[str(idx)] - 
                                                 content_features[str(idx)])**2)
                                     for idx in self.content_layers_idx)

                    total_loss = style_weight * style_loss + content_weight * content_loss

                    if step < num_steps - 1:
                        total_loss.backward(retain_graph=True)
                    else:
                        total_loss.backward()
                    
                    if step % 10 == 0:
                        logger.info(f"Step {step}: style: {style_loss.item():.4f}, "
                                  f"content: {content_loss.item():.4f}")
                    
                    return total_loss

                optimizer.step(closure)


            return self.postprocess_image(output.detach().cpu().squeeze(), original_size)
            
        except Exception as e:
            logger.error(f"Error during style transfer: {str(e)}")
            raise

    def gram_matrix(self, x):
        b, c, h, w = x.size()
        features = x.view(c, h * w)
        gram = torch.mm(features, features.t())
        return gram.div(c * h * w)

    def postprocess_image(self, tensor, original_size):
        mean = torch.tensor([0.485, 0.456, 0.406])
        std = torch.tensor([0.229, 0.224, 0.225])
        tensor = tensor * std[:, None, None] + mean[:, None, None]

        tensor = torch.clamp(tensor, 0, 1)
        transform = transforms.ToPILImage()
        image = transform(tensor)

        if image.size != original_size:
            image = image.resize(original_size, Image.BICUBIC)

        return image
