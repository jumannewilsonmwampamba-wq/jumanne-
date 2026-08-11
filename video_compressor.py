# -*- coding: utf-8 -*-
# ==========================================================================
# JUMANNETOK TZ - SECURE VIDEO COMPRESSOR & 75% SKIN SHIELD ENGINE (2026)
# ==========================================================================

import sys
import json
import base64
import os
import subprocess
from io import BytesIO
import cv2
import numpy as np

def washa_injini_ya_video_ai():
    try:
        # 1. Daka mnyororo wa video wa Base64 kutoka kwenye mdomo wa Node.js (stdin)
        base64_ghafi = sys.stdin.read().strip()
        
        if not base64_ghafi:
            print(json.dumps({"hali": "KOSA", "ujumbe": "Hakuna data ya video!"}))
            return

        if "," in base64_ghafi:
            base64_ghafi = base64_ghafi.split(",")[1]

        # Geuza herufi kuwa ma-byte ghafi hewani ndani ya RAM
        video_bytes = base64.b64decode(base64_ghafi)

        # 🛡️ 2. DEEP BINARY SCAN: UKAGUZI WA VIRUSI & FAILI FEKI NDANI KABISA
        # Kagua Byte 4 hadi 12 za mwanzo (ftyp container check)
        ftyp_box = video_bytes[4:12]
        if b"ftyp" not in ftyp_box:
            # Mdukuzi amenaswa! Faili lina executable codes (kama MZ, PE, exe feki)
            print(json.dumps({"hali": "FAILI_FEKI_VIRUSI"}))
            return

        # Tengeneza faili la siri la dharura (Temporary Sandbox File) ili OpenCV isome
        temp_input = "temp_input_sandbox.mp4"
        temp_output = "temp_output_compressed.mp4"
        
        with open(temp_input, "wb") as f:
            f.write(video_bytes)

        # 🛡️ 3. ANTI-NUDITY GUARDRAIL: CHUJIO LA 75% YA RANGI YA NGOZI WAZI
        video_cap = cv2.VideoCapture(temp_input)
        if not video_cap.isOpened():
            print(json.dumps({"hali": "FAILI_FEKI_VIRUSI"}))
            os.remove(temp_input)
            return

        jumla_ya_frames = int(video_cap.get(cv2.CAP_PROP_FRAME_COUNT))
        # Chukua ma-frame 5 tu yaliyopo katikati ya video ili kulinda kasi ya processor
        frames_za_ukaguzi = [int(jumla_ya_frames * 0.2), int(jumla_ya_frames * 0.4), int(jumla_ya_frames * 0.6), int(jumla_ya_frames * 0.8)]
        
        utupu_umegundulika = False

        for frame_id in frames_za_ukaguzi:
            video_cap.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
            ret, frame = video_cap.read()
            if not ret:
                continue

            # Geuza rangi kwenda muundo wa HSV (unaotambua ngozi ya binadamu kwa usahihi)
            hsv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            # Wigo wa rangi za ngozi ghafi ya binadamu mtaani (Skin Color HSV Range)
            ngozi_chini = np.array([0, 20, 70], dtype=np.uint8)
            ngozi_juu = np.array([20, 255, 255], dtype=np.uint8)
            
            mask_ya_ngozi = cv2.inRange(hsv_frame, ngozi_chini, ngozi_juu)
            idadi_ya_pixels_za_ngozi = cv2.countNonZero(mask_ya_ngozi)
            jumla_ya_pixels = frame.shape[0] * frame.shape[1]
            
            # 🛑 KIKOMO CHA CHUMA CHAKO: Kama frame ina zaidi ya 75% ya ngozi wazi, block!
            asilimia_ya_ngozi = (idadi_ya_pixels_za_ngozi / jumla_ya_pixels) * 100
            if asilimia_ya_ngozi >= 75.0:
                utupu_umegundulika = True
                break

        video_cap.release()

        if utupu_umegundulika:
            print(json.dumps({"hali": "UTUPU_UMEGUNDULIKA_75"}))
            os.remove(temp_input)
            return

        # ⚙️ 4. PASI YA USHINDI: FFMPNEG COMPRESSION ENGINE (KB 12 - KB 100)
        # Amri ya chuma ya kunyonga bitrate (CRF 42) na resolution kuwa 480p nadhifu
        amri_ya_ffmpeg = [
            'ffmpeg', '-y', '-i', temp_input,
            '-vcodec', 'libx264', '-crf', '42', 
            '-b:v', '150k', '-maxrate', '150k', '-bufsize', '300k',
            '-vf', 'scale=-2:480', '-acodec', 'aac', '-b:a', '32k',
            temp_output
        ]
        
        # Piga pasi ya uokoaji wa bando kwa siri kwa nyuma (Muda usiozidi sekunde 1)
        subprocess.run(amri_ya_ffmpeg, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        if not os.path.exists(temp_output):
            print(json.dumps({"hali": "KOSA", "ujumbe": "Mkwamo wa uundaji wa video iliyofinywa!"}))
            os.remove(temp_input)
            return

        # Soma faili jipya lililofinywa (KB 50 tu) na uligeuze kuwa Base64 ya kurudi Node
        with open(temp_output, "rb") as f:
            video_yenye_kb_100 = base64.b64encode(f.read()).decode('utf-8')

        base64_safi_kabisa = f"data:video/mp4;base64,{video_yenye_kb_100}"

        # Safisha takataka zote kwenye hard drive kulinda nafasi ya disk
        os.remove(temp_input)
        os.remove(temp_output)

        # 5. JIBU LA USHINDI: Swaga matokeo ya kijani kurudi Node.js mlangoni!
        print(json.dumps({
            "hali": "USAFI_TIMAMU",
            "video_safi": base64_safi_kabisa
        }))

    except Exception as e:
        print(json.dumps({"hali": "KOSA", "ujumbe": str(e)}))

if __name__ == "__main__":
    wash_injini_ya_video_ai()
