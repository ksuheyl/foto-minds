from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image, ImageEnhance
import os
import time
from aesthetic_model import AestheticAnalyzer
from style_transfer import VanGoghStyleTransfer
import logging
from background_editor import BackgroundEditor
from face_enhancer import FaceEnhancer
from ai_enhancement import AIImageEnhancer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Initialize the aesthetic analyzer
# analyzer = AestheticAnalyzer()

# Initialize the style transfer model
style_transfer = VanGoghStyleTransfer()

# Initialize the background editor
# background_editor = BackgroundEditor()

# Initialize the face enhancer
# face_enhancer = FaceEnhancer()

# Initialize AI enhancer
ai_enhancer = AIImageEnhancer()

@app.route("/auto-enhance", methods=["POST"])
def auto_enhance_image():
    try:
        logger.info("Starting auto-enhance process")
        
        # Validate request
        if "photo" not in request.files:
            logger.error("No file provided in request")
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files["photo"]
        if not file.filename:
            logger.error("Empty filename provided")
            return jsonify({"error": "Empty filename"}), 400
        
        # Get enhancement parameters from query string
        enhance_strength = float(request.args.get('strength', 1.0))
        preserve_tone = request.args.get('preserve_tone', 'true').lower() == 'true'
        quality = int(request.args.get('quality', 95)) 
        
        # Save and process image
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        logger.info(f"Saved input file to {file_path}")
        
        # Basic image validation
        try:
            image = Image.open(file_path)
            if image.format not in ['JPEG', 'PNG', 'WebP']:
                raise ValueError("Unsupported image format")
        except Exception as e:
            logger.error(f"Invalid image file: {str(e)}")
            return jsonify({"error": "Invalid image file"}), 400
        
        # Apply AI enhancement with parameters
        logger.info("Applying AI enhancement with resolution improvement")
        image = ai_enhancer.enhance(
            image,
            strength=enhance_strength,
            preserve_tone=preserve_tone
        )
        
        # Save enhanced image with optimal settings
        current_time = int(time.time() * 1000)
        output_filename = f"enhanced_{current_time}_{file.filename}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        
        # Save with format-specific optimizations
        if image.format == 'JPEG':
            image.save(output_path, 
                      'JPEG', 
                      quality=quality, 
                      optimize=True,
                      subsampling=0)  # Better color sampling
        elif image.format == 'PNG':
            image.save(output_path, 
                      'PNG',
                      optimize=True,
                      compress_level=6)  # Balanced compression
        else:
            image.save(output_path, quality=95, optimize=True)
        
        logger.info(f"Saved enhanced image to {output_path}")
        
        # Cleanup temporary file
        try:
            os.remove(file_path)
        except Exception as e:
            logger.warning(f"Failed to cleanup temporary file: {str(e)}")
        
        return jsonify({
            "processed_image": output_path[8:],
            "full_path": output_filename,
            "status": "success",
            "parameters": {
                "strength": enhance_strength,
                "preserve_tone": preserve_tone
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in auto-enhance: {str(e)}")
        return jsonify({
            "error": "Failed to process image",
            "details": str(e)
        }), 500

@app.route("/analyze-aesthetic", methods=["POST"])
def analyze_aesthetic():
    if "photo" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["photo"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    image = Image.open(file_path)
    composition_data = analyzer.analyze_composition(image)
    exposure_data = analyzer.analyze_exposure(image)
    aesthetic_score = analyzer.predict_score(image)
    suggestions = analyzer.get_suggestions(composition_data, exposure_data)

    analysis_result = {
        "score": aesthetic_score,
        "composition": composition_data,
        "exposure": exposure_data,
        "suggestions": suggestions
    }

    return jsonify(analysis_result), 200

@app.route("/vangogh-style", methods=["POST"])
def apply_vangogh_style():
    try:
        logger.info("Received request for Van Gogh style transfer")
        
        if "photo" not in request.files:
            logger.error("No file uploaded")
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files["photo"]
        if not file.filename:
            logger.error("Empty filename")
            return jsonify({"error": "Empty filename"}), 400
        
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        logger.info(f"Saved input file to {file_path}")
        image = Image.open(file_path)
        logger.info("Starting style transfer")
        
        stylized_image = style_transfer.transfer_style(image)
        logger.info("Style transfer completed")

        current_time = int(time.time() * 1000)
        output_filename = f"vangogh_{current_time}_{file.filename}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        stylized_image.save(output_path)
        logger.info(f"Saved stylized image to {output_path}")

        return jsonify({
            "processed_image": output_filename,
            "full_path": output_path,
            "status": "success"
        }), 200

    except Exception as e:
        logger.error(f"Error in style transfer: {str(e)}")
        return jsonify({
            "error": "Failed to process image",
            "details": str(e)}
        ), 500

@app.route("/remove-background", methods=["POST"])
def remove_background():
    try:
        if "photo" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files["photo"]
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400

        image = Image.open(file).convert('RGBA')
        processed_image = background_editor.remove_background(image)

        current_time = int(time.time() * 1000)
        output_filename = f"nobg_{current_time}_{file.filename}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        processed_image.save(output_path, format='PNG')
        
        return jsonify({
            "processed_image": output_filename,
            "full_path": output_path
        }), 200
        
    except Exception as e:
        logger.error(f"Error in background removal: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/replace-background", methods=["POST"])
def replace_background():
    try:
        if "photo" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        background_path = request.form.get("background")
        if not background_path:
            return jsonify({"error": "No background path provided"}), 400
     
        background_name = os.path.basename(background_path)
        logger.info(f"Background name: {background_name}")
        
        file = request.files["photo"]
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400
        

        image = Image.open(file).convert('RGBA')
        processed_image = background_editor.replace_background(image, background_name)
        
        current_time = int(time.time() * 1000)
        output_filename = f"newbg_{current_time}_{file.filename}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        processed_image.save(output_path, format='PNG')
        
        return jsonify({
            "processed_image": output_filename,
            "full_path": output_path
        }), 200
        
    except Exception as e:
        logger.error(f"Error in background replacement: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/enhance-face", methods=["POST"])
def enhance_face():
    try:
        if "photo" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files["photo"]
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400
        

        image = Image.open(file).convert('RGB')
        enhanced_image = face_enhancer.enhance_facial_features(image)
        current_time = int(time.time() * 1000)
        output_filename = f"enhanced_face_{current_time}_{file.filename}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        enhanced_image.save(output_path)
        
        return jsonify({
            "processed_image": output_filename,
            "full_path": output_path,
        }), 200
        
    except Exception as e:
        logger.error(f"Error in facial enhancement: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/outputs/<filename>')
def get_enhanced_image(filename):
    print(filename)
    return send_from_directory(OUTPUT_FOLDER, filename)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
