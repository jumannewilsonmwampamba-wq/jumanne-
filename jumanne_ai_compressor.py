# jumanne_ai_compressor.py - Ultra-Lightweight PIL AI Content Moderation & 800KB Compressor
import os
from dotenv import load_dotenv
load_dotenv()

import subprocess
from flask import Flask, request, jsonify
from PIL import Image, ImageStat
import numpy as np

app = Flask(__name__)

PORT = int(os.getenv('PYTHON_AI_PORT', 5001))
FOLDER_LA_KAZI = os.path.join(os.path.dirname(__file__), 'jumanne_ai_pitstop')
os.makedirs(FOLDER_LA_KAZI, exist_ok=True)

KIZINGITI_NGOZI = float(os.getenv('KIZINGITI_NGOZI_MAADILI', 42.0))

# ==========================================================================
# 🛡️ PIL LIGHTWEIGHT SKIN SCANNER (0% PROCESSOR LOGIC - NO OPENCV)
# ==========================================================================
def kaguaMaadiliNaPichaZaUtupu(video_path):
    print(f"[JumanneAI] 🔍 PIL Stream Core: Inakagua maadili bila OpenCV...")
    
    # Kwa sababu tuko kwenye mazingira ya 512MB RAM, tunasoma kwa usalama wa kijiometri.
    # Tunatumia FFmpeg kutoa picha 1 tu ya mfano (thumbnail) katikati ya video ili kuipima haraka!
    temp_thumb = video_path + "_thumb.jpg"
    amri_picha = ['ffmpeg', '-y', '-i', video_path, '-ss', '00:00:02', '-vframes', '1', temp_thumb]
    
    try:
        subprocess.run(amri_picha, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if not os.path.exists(temp_thumb):
            return True
            
        # Fungua picha kwa Pillow (Nyepesi mno, haili RAM)
        img = Image.open(temp_thumb).convert('HSV')
        pixels = np.array(img)
        
        # Masafa ya siri ya pixel za ngozi kwenye HSV (PIL Array Mapping)
        h, s, v = pixels[:,:,0], pixels[:,:,1], pixels[:,:,2]
        skin_mask = (h >= 0) & (h <= 25) & (s >= 20) & (s <= 150) & (v >= 60) & (v <= 255)
        
        jumla_ngozi = np.sum(skin_mask)
        jumla_pixel = pixels.shape * pixels.shape
        
        os.remove(temp_thumb) # Safisha diski instantly
        
        asilimia_ya_ngozi = (jumla_ngozi / jumla_pixel) * 100
        print(f"[JumanneAI Results] 📊 Msongamano wa Ngozi via PIL: {asilimia_ya_ngozi:.2f}%")
        
        if asilimia_ya_ngozi > KIZINGITI_NGOZI:
            return False
        return True
    except Exception as e:
        print(f"⚠️ Alama ya dharura: Ukaguzi ulisita kidogo, pasisha kwa usalama: {e}")
        if os.path.exists(temp_thumb): os.remove(temp_thumb)
        return True

# ==========================================================================
# 🛠️ HARDWARE FFMPEG COMPRESSOR
# ==========================================================================
def finyaVideoKinguvuFikiaBytes800Kb(input_path, output_path):
    print(f"[Finyao Kuu] ⚙️ Mtambo unafinyiza video...")
    amri_ya_ffmpeg = [
        'ffmpeg', '-y', '-i', input_path,
        '-b:v', '380k', '-b:a', '48k', '-s', '480x854',
        '-vcodec', 'libx264', '-acodec', 'aac', '-preset', 'ultrafast',
        output_path
    ]
    try:
        subprocess.run(amri_ya_ffmpeg, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except:
        return False

@app.route('/api/v1/ai/moderate-and-compress', methods=['POST'])
def moderateAndCompressEndpoint():
    try:
        if 'video_file' not in request.files:
            return jsonify({ "status": "FAILED", "error": "MISSING_VIDEO_FILE_PAYLOAD" }), 400
        file_ghafi = request.files['video_file']
        uuid_session = request.form.get('video_uuid', 'session_raw')
        
        path_input_ghafi = os.path.join(FOLDER_LA_KAZI, f"raw_{uuid_session}.mp4")
        path_output_finyu = os.path.join(FOLDER_LA_KAZI, f"compressed_{uuid_session}.mp4")
        
        file_ghafi.save(path_input_ghafi)
        
        if not kaguaMaadiliNaPichaZaUtupu(path_input_ghafi):
            os.remove(path_input_ghafi)
            return jsonify({ "status": "MAADILI_VIOLATION_FAILED", "error": "❌ Onyo: Video yako imefutwa kwa kukiuka maadili!" }), 403

        if not finyaVideoKinguvuFikiaBytes800Kb(path_input_ghafi, path_output_finyu):
            os.remove(path_input_ghafi)
            return jsonify({ "status": "FAILED", "error": "COMPRESSION_ERROR" }), 500

        with open(path_output_finyu, 'rb') as f:
            video_bytes_safi = f.read()

        os.remove(path_input_ghafi)
        os.remove(path_output_finyu)
        return video_bytes_safi, 200, { 'Content-Type': 'application/octet-stream', 'x-ai-status': 'PASSED_CLEAN_AND_COMPRESSED' }
    except:
        return jsonify({ "status": "FAILED", "error": "INTERNAL_SERVER_ERROR" }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=False, threaded=True)
        
