# jumanne_ai_compressor.py - Advanced AI Content Moderation & 800KB Video Compressor Server
# 🛡️ SECURITY PATCH: Amsha dotenv ya Python mlangoni pa mstari wa kwanza kabisa!
import os
from dotenv import load_dotenv
load_dotenv() # Inavuta siri zote kutoka kwenye faili la .env instantly!

import subprocess
import shutil
from flask import Flask, request, jsonify
import cv2
import numpy as np

app = Flask(__name__)

# CONFIGURATION VOLUMES (MIPANGILIO INAYOSOMWA KUTOKA KWENYE .ENV SALAMA)
PORT = int(os.getenv('PYTHON_AI_PORT', 5001))
FOLDER_LA_KAZI = os.path.join(os.path.dirname(__file__), 'jumanne_ai_pitstop')
os.makedirs(FOLDER_LA_KAZI, exist_ok=True)

# Kizingiti cha marufuku cha asilimia ya ngozi (Default ni 42.0% isipowekwa kwenye .env)
KIZINGITI_NGOZI = float(os.getenv('KIZINGITI_NGOZI_MAADILI', 42.0))

# ==========================================================================
# 🛡️ MBINU YA KIVITA 1: AI DARUBINI YA MAADILI (SKIN PIXEL DENSITY SCANNER)
# ==========================================================================
def kaguaMaadiliNaPichaZaUtupu(video_path):
    print(f"[JumanneAI] 🔍 Inafungua darubini ya maadili kukagua faili: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("❌ Imeshindikana kufungua video kwa ukaguzi.")
        return False

    jumla_ya_pixel_za_ngozi = 0
    jumla_ya_pixel_zote = 0
    hesabu_ya_frames = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        hesabu_ya_frames += 1
        if hesabu_ya_frames % 15 != 0:
            continue

        hsv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Masafa ya siri ya Rangi ya Ngozi ya Binadamu (HSV Ranges Kitaifa 🇹🇿)
        low_skin = np.array([0, 20, 70], dtype=np.uint8)
        high_skin = np.array([20, 255, 255], dtype=np.uint8)
        
        mask_ngozi = cv2.inRange(hsv_frame, low_skin, high_skin)
        
        jumla_ya_pixel_za_ngozi += cv2.countNonZero(mask_ngozi)
        jumla_ya_pixel_zote += frame.shape[0] * frame.shape[1]

    cap.release()

    if jumla_ya_pixel_zote == 0:
        return True

    asilimia_ya_ngozi = (jumla_ya_pixel_za_ngozi / jumla_ya_pixel_zote) * 100
    print(f"[JumanneAI Results] 📊 Msongamano wa Pixel za Ngozi: {asilimia_ya_ngozi:.2f}% (Kizingiti: {KIZINGITI_NGOZI}%)")

    # Kizingiti kikizidi sheria ya .env, video inapigwa kufuli la kimaadili
    if asilimia_ya_ngozi > KIZINGITI_NGOZI:
        return False
        
    return True

# ==========================================================================
# 🛠️ MBINU YA KIVITA 2: BARE-METAL FFMPEG 800KB VIDEO COMPRESSOR
# ==========================================================================
def finyaVideoKinguvuFikiaBytes800Kb(input_path, output_path):
    print(f"[Finyao Kuu] ⚙️ Mtambo wa FFmpeg unaamka kukandamiza chuma kuelekea KB 800...")
    
    amri_ya_ffmpeg = [
        'ffmpeg',
        '-y',                           
        '-i', input_path,               
        '-b:v', '380k',                 
        '-b:a', '48k',                  
        '-s', '480x854',                
        '-vcodec', 'libx264',           
        '-acodec', 'aac',               
        '-preset', 'ultrafast',         
        output_path
    ]
    
    try:
        subprocess.run(amri_ya_ffmpeg, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        uzito_wa_sasa = os.path.getsize(output_path)
        print(f"[Finyao Kuu] 🏆 Video imefinyika kikomandoo. Uzito: {uzito_wa_sasa / 1024:.2f} KB")
        return True
    except subprocess.CalledProcessError as err:
        print(f"❌ Hitilafu ya chuma cha FFmpeg: {err.stderr.decode('utf-8')}")
        return False

# ==========================================================================
# NGOME YA HTTP: MLANGO MKUU WA NETWORK CORE INTERACTION (PORT 5001)
# ==========================================================================
@app.route('/api/v1/ai/moderate-and-compress', methods=['POST'])
def moderateAndCompressEndpoint():
    try:
        if 'video_file' not in request.files:
            return jsonify({ "status": "FAILED", "error": "MISSING_VIDEO_FILE_PAYLOAD" }), 400
            
        file_ghafi = request.files['video_file']
        uuid_session = request.form.get('video_uuid', 'session_raw')
        
        path_input_ghafi = path.join(FOLDER_LA_KAZI, f"raw_{uuid_session}.mp4")
        path_output_finyu = path.join(FOLDER_LA_KAZI, f"compressed_{uuid_session}.mp4")
        
        file_ghafi.save(path_input_ghafi)

        maadili_yako_sawa = kaguaMaadiliNaPichaZaUtupu(path_input_ghafi)
        
        if not maadili_yako_sawa:
            os.remove(path_input_ghafi)
            print(f"[JumanneAI Alert] 🛑 Video ya session {uuid_session} IMEFUTWA!")
            return jsonify({
                "status": "MAADILI_VIOLATION_FAILED",
                "error": "❌ Onyo: Video yako imefutwa kiotomatiki kwa kukiuka maadili ya JumanneTok TZ!"
            }), 403

        finyao_limekubali = finyaVideoKinguvuFikiaBytes800Kb(path_input_ghafi, path_output_finyu)
        
        if not finyao_limekubali:
            os.remove(path_input_ghafi)
            return jsonify({ "status": "FAILED", "error": "COMPRESSION_ENGINE_CRASH" }), 500

        with open(path_output_finyu, 'rb') as f:
            video_bytes_safi = f.read()

        os.remove(path_input_ghafi)
        os.remove(path_output_finyu)

        return video_bytes_safi, 200, {
            'Content-Type': 'application/octet-stream',
            'x-ai-status': 'PASSED_CLEAN_AND_COMPRESSED'
        }

    except Exception as e:
        print(f"🚨 Master Error Nyuma ya Pazia: {str(e)}")
        return jsonify({ "status": "FAILED", "error": "INTERNAL_SERVER_ERROR" }), 500

if __name__ == '__main__':
    print(f"\n🏟️  [JumanneTok AI Guard] Seva ya Python imewaka kwenye PORT {PORT}!")
    app.run(host='0.0.0.0', port=PORT, debug=False, threaded=True)

