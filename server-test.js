// ==========================================================================
// JUMANNETOK TZ - CORE CUSTOM JSON DATABASE SYSTEM (VIDEODB.JS INTEGRATION)
// ==========================================================================
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 1. NGOME YA SIRI: NJIA RASMI YA DATABASE YETU YA NDANI YA VIDEODB.JS
const PATH_VIDEODB = path.join(__dirname, "videodb.js");
const FOLDER_VIDEO_UP = path.join(__dirname, "vipaji_ghafi_test");

// Uhakiki wa ki-hardware: Hakikisha folda la video na faili la database vipo diski kuu
if (!fs.existsSync(FOLDER_VIDEO_UP)) {
    fs.mkdirSync(FOLDER_VIDEO_UP);
}

if (!fs.existsSync(PATH_VIDEODB)) {
    // Kama database haikuwepo, ianzishe ikiwa kama Array tupu safi ya JSON
    fs.writeFileSync(PATH_VIDEODB, JSON.stringify([], null, 4), "utf8");
    console.log("🛡️ Storage Lock: Faili jipya la database ya videodb.js limezinduliwa!");
}

// 2. INJINI YA MULTER KUKAMATA VIDEO BINARY KUTOKA KWA XHR
const akibaYaMuda = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, FOLDER_VIDEO_UP); },
    filename: (req, file, cb) => { cb(null, `jumanne_video_${Date.now()}.mp4`); }
});
const uploadMtambo = multer({ storage: akibaYaMuda });

// 3. NJIA KUU (POST ROUTE): POKEA VIDEO, LAZA FILE, NA CHOMEKA DATA VIDEODB.JS
app.post("/api/v1/videos/upload-test", uploadMtambo.single("videoFile"), (req, res) => {
    // Uhakiki wa Saini ya siri ya CDN Edge kuzuia udukuzi wa ma-robot mlangoni
    const lockCdn = req.headers["x-jumanne-edge-lock"];
    if (lockCdn !== "CDN_HYDRATION_ACTIVE") {
        console.error("❌ Udukuzi! Mrija umepigwa hodi kienyeji bila saini ya mbelembele.");
        return res.status(403).json({ success: false, msg: "Edge Lock Denied" });
    }

    if (!req.file) {
        console.error("❌ Mkwamo! Hakuna faili la video lililotua mlangoni pa seva.");
        return res.status(400).json({ success: false, msg: "No video file found" });
    }

    try {
        // A. SOMA DATA ZOTE ZILIZOMO KWANZA KUTOKA KWENYE DATABASE YETU YA JSON
        const dataGhafi = fs.readFileSync(PATH_VIDEODB, "utf8");
        const orodhaYaVideo = JSON.parse(dataGhafi);

        // B. SUKA KETE MPYA YA MSANII ILIYOFUNGWA KITALAMU
        const kadiMpyaYaVideo = {
            id: String(orodhaYaVideo.length + 1),
            artistId: req.body.artistId || "999",
            videoTitle: req.body.videoTitle || "Singeli ya Majaribio Kitaifa",
            videoCategory: req.body.videoCategory || "SINGELI",
            videoType: req.body.videoType || "KAWAIDA",
            videoUrlPath: `/vipaji_ghafi_test/${req.file.filename}`, // Njia ya ndani ya ki-hardware
            uploadedAt: new Date().toISOString()
        };

        // C. CHOMEKA KETE HII MPYA NDANI YA ARRAY YETU WENYEWE
        orodhaYaVideo.push(kadiMpyaYaVideo);

        // D. PIGA CHAPA NA KUGANDISHA MZIGO DISKI KUU KWA MPIGO MMOJA WA CHUMA
        fs.writeFileSync(PATH_VIDEODB, JSON.stringify(orodhaYaVideo, null, 4), "utf8");

        console.log(`🎉 USHINDI WA KIBILIONEA: Video '${req.file.originalname}' imetua na kete imelazwa ndani ya database yetu ya videodb.js!`);
        return res.status(200).json({ success: true, msg: "Video written to custom videodb.js database successfully!" });

    } catch (errDb) {
        console.error("❌ Dhoruba: Mtambo umeshindwa kuandika ndani ya videodb.js:", errDb.message);
        return res.status(500).json({ success: false, msg: "Custom Database Internal Write Error" });
    }
});

// Washa mtambo wa JumanneDB Kernel Live Render kwenye PORT 3001 au 5000 kulingana na seva
const NDIWANI_PORT = process.env.PORT || 3001;
app.listen(NDIWANI_PORT, () => {
    console.log(`📡 JumanneDB Kernel active on PORT ${NDIWANI_PORT} with Custom videodb.js ...`);
});
