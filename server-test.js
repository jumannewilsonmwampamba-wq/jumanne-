// ==========================================================================
// JUMANNETOK TZ - CORE CUSTOM JSON DATABASE SYSTEM (ES MODULES ACTIVATED)
// ==========================================================================
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
// 🔥 ZIBIKO LA CORS LA KI-HARDWARE: Ruhusu domain yoyote (pamoja na github.io) ivute video stream bila lag!
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Jumanne-Edge-Lock");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    // Kama kivinjari kinarusha ombi la uthibitisho (Preflight request), kiruhusu kiruke sekunde 0
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// 🔥 MANUVA YA KI-HARDWARE: Kwenye ES Modules "__dirname" haipo kiasili, lazima tuisuke hivi!
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NGOME YA SIRI: NJIA RASMI YA DATABASE YETU YA NDANI YA VIDEODB.JS
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

        // D. PIGA CHAPA NA KUGANDISHA MZIGO DISKI KUZUIA LAG KWA MPIGO MMOJA KUU
        fs.writeFileSync(PATH_VIDEODB, JSON.stringify(orodhoYaVideo, null, 4), "utf8");

        console.log(`🎉 USHINDI WA KIBILIONEA: Video '${req.file.originalname}' imetua na kete imelazwa ndani ya database!`);
        return res.status(200).json({ success: true, msg: "Video written to custom videodb.js database successfully!" });

    } catch (errDb) {
        console.error("❌ Dhoruba: Mtambo umeshindwa kuandika ndani ya videodb.js:", errDb.message);
        return res.status(500).json({ success: false, msg: "Custom Database Internal Write Error" });
    }
});

// 4. NJIA YA PILI (GET ROUTE): MTAMBO WA STREAMING UNAOCHOMA VIDEO MNYOFU ICHEZE KIONI
app.get("/api/v1/videos/stream-test", (req, res) => {
    let failiLaMwisho = "test_singeli.mp4"; 
    try {
        const maFiles = fs.readdirSync(FOLDER_VIDEO_UP).filter(f => f.endsWith(".mp4"));
        if (maFiles.length > 0) {
            maFiles.sort((a, b) => {
                return fs.statSync(path.join(FOLDER_VIDEO_UP, b)).mtime.getTime() - 
                       fs.statSync(path.join(FOLDER_VIDEO_UP, a)).mtime.getTime();
            });
            failiLaMwisho = maFiles[0];
        }
    } catch (eDir) {}

    const njiaYaFaili = path.join(FOLDER_VIDEO_UP, failiLaMwisho);

    if (!fs.existsSync(njiaYaFaili)) {
        return res.status(404).send("❌ Video bado haijapandishwa kwenye database ya seva!");
    }

    const range = req.headers.range;
    if (!range) {
        return res.status(400).send("Requires Range header for video streaming pipeline");
    }

    const ukubwaWaFaili = fs.statSync(njiaYaFaili).size;
    const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunk size kwa ajili ya kuondoa lag ya bando
    const mwanzo = Number(range.replace(/\D/g, ""));
    const mwisho = Math.min(mwanzo + CHUNK_SIZE, ukubwaWaFaili - 1);

    const urefuWaContent = mwisho - mwanzo + 1;
    const vichwaVyaHabari = {
        "Content-Range": `bytes ${mwanzo}-${mwisho}/${ukubwaWaFaili}`,
        "Accept-Ranges": "bytes",
        "Content-Length": urefuWaContent,
        "Content-Type": "video/mp4"
    };

    res.writeHead(206, vichwaVyaHabari);
    const mrijaWaKusoma = fs.createReadStream(njiaYaFaili, { start: mwanzo, end: mwisho });
    mrijaWaKusoma.pipe(res);
});

// Washa mtambo wa JumanneDB Kernel Live Render kwenye port ya mazingira (Environment Port)
const NDIWANI_PORT = process.env.PORT || 3001;
app.listen(NDIWANI_PORT, () => {
    console.log(`📡 JumanneDB Kernel active on PORT ${NDIWANI_PORT} with ES Modules...`);
});
    
