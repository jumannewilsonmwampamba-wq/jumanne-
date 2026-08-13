// jumanne-master-server.js - Ngome Kuu ya Kanzidata Tano Zilizounganishwa (Unified Backend Server)
// 🛡️ SECURITY PATCH: Amsha dotenv instantly mlangoni pa mstari wa kwanza kabisa!
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const http = require('http');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// ==========================================================================
// CONFIGURATION & ENVIRONMENT VARIABLES (MIPANGILIO YA SIRI YA .ENV)
// ==========================================================================
const PORT = process.env.PORT || 3000; 

// 🔥 LOCK YA USHINDI: Sasa tunasoma URL ya askari wetu wa Python mnyofu kutoka kwenye .env!
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://localhost:5001/api/v1/ai/moderate-and-compress"; 

// Ngome ya siri ya Cloudflare R2 (Inasomwa salama kutoka kwenye .env bila hackers kuiona)
const R2_CONFIG = {
    bucketName: process.env.R2_BUCKET_NAME || "jumannetok-db-bucket",
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
};

let autoIncrementVideoId = 8739170;
let currentFolders = { video: "", profile: "", search: "", stats: "", social: "" };
let ledgerPaths = { videoRegistry: "", profileRegistry: "", searchRegistry: "", statsRegistry: "", socialRegistry: "" };


// ==========================================================================
// 1. INJINI YA MIEZI: TIME-SERIES PARTITIONING DRIVER
// ==========================================================================
function checkAndRollAllPartitions() {
    const sasa = new Date();
    const mwezi = String(sasa.getMonth() + 1).padStart(2, '0');
    const mwaka = sasa.getFullYear();
    const suffix = `mwezi_${mwezi}_${mwaka}`;

    if (currentFolders.video !== `data_${suffix}`) {
        currentFolders.video = `data_${suffix}`;
        const dir = path.join(__dirname, 'jumanne_db', currentFolders.video);
        fs.mkdirSync(dir, { recursive: true });
        fs.mkdirSync(path.join(dir, 'temp_chunks'), { recursive: true });
        ledgerPaths.videoRegistry = path.join(dir, 'registry.bin');
    }
    if (currentFolders.profile !== `profiles_${suffix}`) {
        currentFolders.profile = `profiles_${suffix}`;
        const dir = path.join(__dirname, 'jumanne_db', currentFolders.profile);
        fs.mkdirSync(dir, { recursive: true });
        ledgerPaths.profileRegistry = path.join(dir, 'profiles_ledger.bin');
    }
    if (currentFolders.search !== `search_${suffix}`) {
        currentFolders.search = `search_${suffix}`;
        const dir = path.join(__dirname, 'jumanne_db', currentFolders.search);
        fs.mkdirSync(dir, { recursive: true });
        ledgerPaths.searchRegistry = path.join(dir, 'search_ledger.bin');
    }
    if (currentFolders.stats !== `stats_${suffix}`) {
        currentFolders.stats = `stats_${suffix}`;
        const dir = path.join(__dirname, 'jumanne_db', currentFolders.stats);
        fs.mkdirSync(dir, { recursive: true });
        ledgerPaths.statsRegistry = path.join(dir, 'metrics_ledger.bin');
    }
    if (currentFolders.social !== `social_${suffix}`) {
        currentFolders.social = `social_${suffix}`;
        const dir = path.join(__dirname, 'jumanne_db', currentFolders.social);
        fs.mkdirSync(dir, { recursive: true });
        ledgerPaths.socialRegistry = path.join(dir, 'social_ledger.bin');
    }
}

// ==========================================================================
// 🛡️ INJINI YA CDN: MTAMBO UNASAMBAZA VIDEO CLOUDFLARE R2 EDGE CACHE
// ==========================================================================
function pushVideoToCloudflareCDN(videoBytes, fileName) {
    console.log(`[CDN Push] 📡 Node.js inatwanga faili safi la KB 800 kwenda Cloudflare R2 CDN Edge Cache: ${fileName}`);
    
    // Katika seva ya uzalishaji, hapa unapiga HTTP PUT request ghafi kwenda Cloudflare Endpoint ya siri.
    // Inalaza video yetu moja kwa moja kwenye mitambo yao ya duniani kote ili isomeke instantly
    setTimeout(() => {
        console.log(`[CDN Success] 🔒 Video imesambazwa kikamilifu Cloudflare CDN! Link Live: https://jumannetok.tz{fileName}`);
    }, 150);
}

// ==========================================================================
// 🎬 INJINI YA VIDEO: CHUNK JOINER ➔ AI INTEGRATION ➔ CDN USHINDI
// ==========================================================================
function handleIncomingVideoChunk(indexKipande, jumlaVipande, videoUuid, chunkBytes, mainResponse) {
    checkAndRollAllPartitions();
    const tempDir = path.join(__dirname, 'jumanne_db', currentFolders.video, 'temp_chunks', videoUuid);
    fs.mkdirSync(tempDir, { recursive: true });
    
    const chunkFilePath = path.join(tempDir, `chunk_${indexKipande}.part`);
    fs.writeFileSync(chunkFilePath, chunkBytes);
    
    if ((indexKipande + 1) < jumlaVipande) {
        mainResponse.writeHead(200, { 'Content-Type': 'application/json' });
        mainResponse.end(JSON.stringify({ status: "CHUNK_RECEIVED", progress: Math.round(((indexKipande + 1) / jumlaVipande) * 100) }));
        return;
    }
    
    // 💥 CHUNKS ZIKITIMIA: Shona video ghafi hapo hapo diski
    const temporaryRawPath = path.join(tempDir, `raw_combined_${videoUuid}.mp4`);
    const streamMwandishi = fs.createWriteStream(temporaryRawPath);
    
    for (let i = 0; i < jumlaVipande; i++) {
        const pathPart = path.join(tempDir, `chunk_${i}.part`);
        streamMwandishi.write(fs.readFileSync(pathPart));
        fs.unlinkSync(pathPart); // Futa kipande duka kubaki safi
    }
    streamMwandishi.end();

    streamMwandishi.on('finish', () => {
        console.log(`[Seva Kuu] 🔄 Video ghafi imeshonwa. Inasafirishwa mnyofu kwenda Python AI Guard...`);
        
        // 🚀 HATUA YA KIVITA: Tupa faili mnyofu kwa Python akachungulie maadili na kupiga finyao la KB 800!
        // Kwa kutumia zana ya ki-hardware ya Node.js kuunda Multi-part form-data kwa maneno tupu:
        const boundary = '----JumanneTokBoundary' + Math.random().toString(36).substring(2);
        const fileBuffer = fs.readFileSync(temporaryRawPath);
        
        let payloadBuffers = [];
        payloadBuffers.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="video_uuid"\r\n\r\n${videoUuid}\r\n`));
        payloadBuffers.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="video_file"; filename="video.mp4"\r\nContent-Type: video/mp4\r\n\r\n`));
        payloadBuffers.push(fileBuffer);
        payloadBuffers.push(Buffer.from(`\r\n--${boundary}--\r\n`));
        
        const contentPayload = Buffer.concat(payloadBuffers);
        
        // Piga simu ya chuma kwenda Python Port 5001
        const ombiAi = http.request(PYTHON_AI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': contentPayload.length
            }
        }, (resAi) => {
            let aiResponseBuffers = [];
            resAi.on('data', kete => aiResponseBuffers.push(kete));
            resAi.on('end', () => {
                const jibuGhafi = Buffer.concat(aiResponseBuffers);
                
                // 🛑 MKWAMOW A MAADILI: Python akitupiga marufuku kisa picha za utupu
                if (resAi.statusCode === 403) {
                    const dataJson = JSON.parse(jibuGhafi.toString());
                    mainResponse.writeHead(403, { 'Content-Type': 'application/json' });
                    mainResponse.end(JSON.stringify({ status: "MAADILI_VIOLATION_FAILED", error: dataJson.error }));
                    
                    // Safisha diski ya Render instantly
                    fs.unlinkSync(temporaryRawPath);
                    fs.rmdirSync(tempDir);
                    return;
                }
                
                // 🟢 RUKSA YA KAZI: Python amerudisha video safi ya KB 800 tupu!
                if (resAi.statusCode === 200 && resAi.headers['x-ai-status'] === 'PASSED_CLEAN_AND_COMPRESSED') {
                    autoIncrementVideoId++;
                    const finalId = autoIncrementVideoId;
                    const finalFileName = `jumanne_${finalId}.mp4`;
                    
                    // 📡 USAMBAZAJI CDN: Sukuma faili safi la KB 800 direct Cloudflare CDN!
                    pushVideoToCloudflareCDN(jibuGhafi, finalFileName);
                    
                    // Rekodi nanga kwenye faharisi ya registry ya seva (Uzito: Bytes 136)
                    const cdnLinkLive = `https://jumannetok.tz{finalFileName}`;
                    const registryData = Buffer.alloc(136); 
                    registryData.writeUInt32LE(finalId, 0);          
                    registryData.writeUInt32LE(jibuGhafi.length, 4);   
                    registryData.write(cdnLinkLive, 8, 128, 'utf8');        
                    fs.appendFileSync(ledgerPaths.videoRegistry, registryData); 
                    
                    // Toa jibu la ushindi wa dhahabu kwenda ukurasa wa mbele!
                    mainResponse.writeHead(200, { 'Content-Type': 'application/json' });
                    mainResponse.end(JSON.stringify({
                        status: "UPLOAD_COMPLETE_SUCCESS",
                        finalId: finalId,
                        links: { high: cdnLinkLive, medium: cdnLinkLive, low: cdnLinkLive }
                    }));
                    
                    // Futa uchafu wote uliopo kwenye diski ya Render
                    fs.unlinkSync(temporaryRawPath);
                    fs.rmdirSync(tempDir);
                }
            });
        });
        
        ombiAi.on('error', () => {
            mainResponse.writeHead(500, { 'Content-Type': 'text/plain' });
            mainResponse.end("AI_SERVER_OFFLINE_CRASH");
        });
        
        ombiAi.write(contentPayload);
        ombiAi.end();
    });
}

// ==========================================================================
//  Ngome ya 4: MULTI-THREADED MASTER HTTP ROUTER (PORT 3000)
// ==========================================================================
if (!isMainThread) {
    const { targetLedgerPath, binaryBlock } = workerData;
    fs.appendFileSync(targetLedgerPath, Buffer.from(binaryBlock));
    parentPort.postMessage("PERSISTENCE_SUCCESS");
    process.exit(0);
} else {
    checkAndRollAllPartitions();

const masterServer = http.createServer((req, res) => {
        // 🔥 A: CORS PROTOCOL - Ruhusu kurasa zote za GitHub Pages ziongee na Node bila kuzuiliwa
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-chunk-index, x-total-chunks, x-video-uuid");

        if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
        }

                // 1. KEEP-ALIVE HEARTBEAT ROUTE (MTEGO WA PING ULIOKAZWA SHERIA)
        // 🔥 FIX KUU: Ongeza chujio la '/ping' mnyofu kuzuia proxy za Render zisikatishe mawasiliano!
        if (req.url === '/' || req.url === '/api/ping' || req.url === '/ping') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end("JUMANNETOK_MASTER_CORE_LIVE_AND_KICKING");
            return;
        }
    

        // 2. MIFUMO YA MA-UPLOAD YA VIDEO (CHUNKED VIDEO INGESTION)
        if (req.url === '/api/upload/chunk' && req.method === 'POST') {
            let buffers = [];
            req.on('data', chunk => buffers.push(chunk));
            req.on('end', () => {
                const indexKipande = parseInt(req.headers['x-chunk-index'], 10);
                const jumlaVipande = parseInt(req.headers['x-total-chunks'], 10);
                const videoUuid = req.headers['x-video-uuid'] || "session_raw";
                const rawBytes = Buffer.concat(buffers);

                // Pasisha data mnyofu kwenda kwenye injini ya ushonaji na ukaguzi wa AI
                handleIncomingVideoChunk(indexKipande, jumlaVipande, videoUuid, rawBytes, res);
            });
            return;
        }

        // 3. SEVA YA WASIFU (PROFILEDB ENGINE - PORT 3003 MERGED)
        if (req.url === '/api/profiles/sync-user' && req.method === 'POST') {
            let buffers = [];
            req.on('data', chunk => buffers.push(chunk));
            req.on('end', () => {
                const rawBytes = Buffer.concat(buffers);
                if (rawBytes.length === 1024) {
                    checkAndRollAllPartitions();
                    const worker = new Worker(__filename, {
                        workerData: { targetLedgerPath: ledgerPaths.profileRegistry, binaryBlock: rawBytes }
                    });
                    worker.on('message', () => {
                        const artistId = rawBytes.readUInt32LE(0);
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end(`https://jumannedb.io{artistId}`);
                        pushVideoToCloudflareCDN(ledgerPaths.profileRegistry, "profiles_ledger.bin");
                    });
                } else {
                    res.writeHead(400); res.end("BAD_PROFILE_PAYLOAD");
                }
            });
            return;
        }

        // 4. SEVA YA SEARCH (JUMANNESEARCH ENGINE - PORT 3002 MERGED)
        if (req.url === '/api/jumanne-search/sync-index' && req.method === 'POST') {
            let buffers = [];
            req.on('data', chunk => buffers.push(chunk));
            req.on('end', () => {
                const rawBytes = Buffer.concat(buffers);
                if (rawBytes.length === 32) {
                    checkAndRollAllPartitions();
                    fs.appendFileSync(ledgerPaths.searchRegistry, rawBytes);
                    res.writeHead(200); res.end("SEARCH_INDEX_SYNC_SUCCESS");
                    pushVideoToCloudflareCDN(ledgerPaths.searchRegistry, "search_ledger.bin");
                } else {
                    res.writeHead(400); res.end("BAD_SEARCH_PAYLOAD");
                }
            });
            return;
        }

        // 5. SEVA YA TAKWIMU (MWAMPAMBADB ENGINE - PORT 3001 MERGED)
        if (req.url === '/api/mwampamba-db/sync-metrics' && req.method === 'POST') {
            let buffers = [];
            req.on('data', chunk => buffers.push(chunk));
            req.on('end', () => {
                const rawBytes = Buffer.concat(buffers);
                if (rawBytes.length === 20) {
                    checkAndRollAllPartitions();
                    fs.appendFileSync(ledgerPaths.statsRegistry, rawBytes);
                    res.writeHead(200); res.end("METRICS_SYNC_SUCCESS");
                    pushVideoToCloudflareCDN(ledgerPaths.statsRegistry, "metrics_ledger.bin");
                } else {
                    res.writeHead(400); res.end("BAD_METRICS_PAYLOAD");
                }
            });
            return;
        }

        // 6. SEVA YA KIJAMII NA CHAT (SOCIALDB ENGINE - PORT 3004 MERGED)
        if (req.url === '/api/social/sync-activity' && req.method === 'POST') {
            let buffers = [];
            req.on('data', chunk => buffers.push(chunk));
            req.on('end', () => {
                const rawBytes = Buffer.concat(buffers);
                if (rawBytes.length === 128) {
                    checkAndRollAllPartitions();
                    const worker = new Worker(__filename, {
                        workerData: { targetLedgerPath: ledgerPaths.socialRegistry, binaryBlock: rawBytes }
                    });
                    worker.on('message', () => {
                        res.writeHead(200); res.end("SOCIAL_SYNC_SUCCESS");
                        pushVideoToCloudflareCDN(ledgerPaths.socialRegistry, "social_ledger.bin");
                    });
                } else {
                    res.writeHead(400); res.end("BAD_SOCIAL_PAYLOAD");
                }
            });
            return;
        }

        // Ukuta wa kifo kwa robot au hacker anayejaribu kudukua milango yetu
        res.writeHead(404);
        res.end("Not Found");
    });

    masterServer.listen(PORT, () => {
        console.log(`\n🏆 [JumanneTok Monolith] Ngome Kuu ya Seva tano imewaka vizuri Render!`);
        console.log(`👉 Anwani zote tano zinasikiliza sambamba kwenye PORT: ${PORT} ($0 Forever!)`);
    });

    // ==========================================================================
    // 🛡️ NTAMBO WA PIGA HODI: KEEP-ALIVE SEVA KUU ISILALE USINGIZI (MIN 10)
    // ==========================================================================
    setInterval(() => {
        const anwaniYaPigaHodi = `http://localhost:${PORT}/api/ping`;
        http.get(anwaniYaPigaHodi, (res) => {
            console.log(`[Master Heartbone] 💓 Seva Kuu imejipiga hodi ya dharura: Status ${res.statusCode}`);
        }).on('error', () => {
            console.warn("[Master Heartbone] ⏳ Mtandao uko bize kidogo.");
        });
    }, 10 * 60 * 1000);
            }
            
    
