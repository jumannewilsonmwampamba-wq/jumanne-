
// Vyumba vikuu vya kimataifa vinavyoshikilia database ya ndani ya simu [A]
let dbJumanneEdgeCache = null;
let mtafutajiMkuuWaUploadIndex = null; 
let xhrMsaidiziWaGlobal = null; 

// 🔥 MTAMBO WA RAM: Vikapu vya siri vinavyobeba Like na Follow kwa dakika 2 [A]
let kikapuRAM_Likes = {};
let kikapuRAM_Followers = {};

// Swichi za siri zinazozuia data zisiguse diski mtumiaji akighairi (Cancel Timers) [A]
let timersZaKughairiDebounce = {};
// ==========================================================================
// JUMANNETOK TZ - MASTER EDGE ENGINE (KIPANDE CHA 2 - INDEXEDDB STORAGE INITIALIZER)
// ==========================================================================

// 1. AMRE KUU: FUNGUA DATABASE YA NDANI MARA TU USER ANAPOTUA HOME FEED [A]
function amshaDukaLaHomeFeedLocal() {
    // Fungua duka la Ndani ya simu ya mteja (Version 1) [A]
    const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

    // Kama database haikuwepo au imebadilishwa, unda ma-chumba upya mlangoni [A]
    ombiDuka.onupgradeneeded = function(e) {
        const db = e.target.result;
        
        // A. Chumba cha akiba ya upakiaji wa video (Upload Drafts) [A]
        if (!db.objectStoreNames.contains("jumannetok_feed_cache")) {
            db.createObjectStore("jumannetok_feed_cache");
        }
        
        // B. Chumba cha siri cha kulinda miamala ya kura (Pending Metrics Queue) [A]
        if (!db.objectStoreNames.contains("jumanne_pending_analytics")) {
            db.createObjectStore("jumanne_pending_analytics");
        }
        console.log("🛡️ Storage Lock: Ma-database yote ya ndani yameshafungwa chuma kiononi!");
    };

    // Database ikifunguka salama hewani, daka mawasiliano yake mnyofu [A]
    ombiDuka.onsuccess = function(e) {
        dbJumanneEdgeCache = e.target.result;
        console.log("🍃 Index Feed: Database ipo macho, inakagua upload na kura za nyuma...");
        
        // 🔥 WALINZI WAPYA WA DAKIKA 20 YA CRASH RECOVERY:
        if (typeof kaguaMiamalaYaKuraZilizogandaMlangoni === "function") {
            kaguaMiamalaYaKuraZilizogandaMlangoni();
        }
        if (typeof kaguaNaUwasheUploadYaNyumaYaPazia === "function") {
            kaguaNaUwasheUploadYaNyumaYaPazia();
        }
    };

    ombiDuka.onerror = function() {
        console.error("❌ Mkwamo wa kufungua database ya ndani kwenye Home Feed.");
    };
}
// ==========================================================================
// JUMANNETOK TZ - MASTER EDGE ENGINE (KIPANDE CHA 3 - BOOT CRASH RECOVERY CHECK)
// ==========================================================================

// ==========================================================================
// MAREKEBISHO YA CHUMA: KIPANDE CHA 3 (BOOT CRASH RECOVERY CHECK BILA ERROR) [A]
// ==========================================================================
function kaguaMiamalaYaKuraZilizogandaMlangoni() {
    if (!dbJumanneEdgeCache) return;

    try {
        if (!dbJumanneEdgeCache.objectStoreNames.contains("jumanne_pending_analytics")) return;

        const muamala = dbJumanneEdgeCache.transaction(["jumanne_pending_analytics"], "readonly");
        const duka = muamala.objectStore("jumanne_pending_analytics");
        const ombiKagua = duka.openCursor(); // 🧠 Imekaa sawa hapa

        let amriKuwashaSevaNdogo = false;

        // 🔥 SULUHISHO: K ya herufi kubwa imerekebishwa hapa kuzuia DOMException! [A]
        ombiKagua.onsuccess = function(e) {
            const cursor = e.target.result;
            if (cursor) {
                const data = cursor.value;
                const mudaSasa = Date.now();
                
                if (data.muda_wa_kuanza && (mudaSasa - data.muda_wa_kuanza) >= 1200000) {
                    amriKuwashaSevaNdogo = true;
                }
                cursor.continue(); 
            } else {
                if (amriKuwashaSevaNdogo && typeof lipuaMiamalaYoteKwendaSevaKiume === "function") {
                    console.log("🛡️ Crash Recovery: Mfumo umepishana na kura za zamani! Unaziswaga seva...");
                    lipuaMiamalaYoteKwendaSevaKiume();
                }
            }
        };

        ombiKagua.onerror = function(err) {
            console.error("Hitilafu ya ukaguzi wa kura zilizoganda:", err);
        };

    } catch (dhorubaDOM3) {
        // Mtego wa chuma unaozika DOMException zote jalalani upole [A]
        console.error("🛡️ DOMException Guard (Kipande 3) Imeshtuka:", dhorubaDOM3.message);
    }
}

// III. INJINI YA KIULICHO: INACHORA KADI YENYE MA-AVATAR NA VIFUNGO VYA KISANII KIONI [A]
function choraKadiYaVideoYaMtejaMubashara(data) {
    const cardHolder = document.getElementById("jumanne-background-upload-card-holder");
    if (!cardHolder) return;

    try {
        const localVideoURL = URL.createObjectURL(data.videoBlobData);
        const captionText = data.video_caption || "";
        const categoryText = data.video_category ? data.video_category.toUpperCase() : "FREESTYLE";
        const typeText = data.video_type ? data.video_type.toUpperCase() : "KAWAIDA";

        // Suka muundo safi wa kadi ya kuvutia ya skrini nzima ya chuma [A]
        cardHolder.innerHTML = `
            <div class="jumanne-video-card" id="jumanne-background-uploading-card" style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: #000000; z-index: 5; box-sizing: border-box; overflow: hidden;">
                
                <!-- Video player ya skrini nzima -->
                <video class="jumanne-feed-player" loop playsinline autoplay muted
                       style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
                    <source src="${localVideoURL}" type="video/mp4">
                </video>

                <!-- 👤 MKONO WA KUSHOTO CHINI: MAELEZO YA MSANII NA FOLLOW YA KIDONGE [A] -->
                <div style="position: absolute; bottom: 100px; left: 15px; z-index: 10; text-align: left; max-width: 70%; pointer-events: auto;">
                    <h3 style="margin: 0 0 4px 0; font-size: 15px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); font-weight: bold; font-family: sans-serif;">@Mimi (Unapakia...)</h3>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #eeeeee; line-height: 1.4; text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-family: sans-serif;">${captionText}</p>
                    
                    <!-- 🔥 KITUFE CHA FOLLOW CHA KIDONGE CHINI YA JINA LA MSANII [A] -->
                    <button type="button" id="jumanne-follow-btn-mimi" onclick="gusaFollowMuziki('mimi_draft_id')" style="background: #00e676; color: #000000; border: none; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,230,118,0.4); margin-bottom: 8px; transition: all 0.2s ease; font-family: sans-serif;">
                        <i class="fas fa-plus-circle" id="jumanne-follow-icon-mimi"></i> <span id="jumanne-follow-text-mimi">Follow</span>
                    </button>
                    <br>

                    <!-- Neon Glow badge ya aina ya video -->
                    <span style="display: inline-block; background: rgba(0,230,118,0.15); border: 1px solid #00e676; color: #00e676; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; font-family: monospace; letter-spacing: 0.5px; text-shadow: 0 0 5px rgba(0,230,118,0.5);">
                        <i class="fas fa-bolt"></i> ${categoryText} | ${typeText}
                    </span>
                </div>

                <!-- 🧭 MKONO WA KULIA: NGŪZO YA ACTION YENYE FROSTED GLASS EFFECT [A] -->
                <div style="position: absolute; bottom: 120px; right: 15px; z-index: 10; display: flex; flex-direction: column; gap: 18px; align-items: center; pointer-events: auto;">
                    
                    <!-- Avatar ya Mteja yenye Alama ya Kujumlisha ya dharura -->
                    <div style="position: relative; width: 45px; height: 46px; border-radius: 50%; border: 2px solid #00e676; background: #222; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                        <i class="fas fa-user-circle" style="font-size: 38px; color: #666;"></i>
                        <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; background: #ff5252; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                            <i class="fas fa-plus" style="color: #ffffff; font-size: 9px; font-weight: bold;"></i>
                        </div>
                    </div>

                    <!-- Kitufe cha Likes cha Frosted Glass Blur -->
                    <div style="text-align: center; cursor: pointer; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 8px; border-radius: 50%; width: 44px; height: 44px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" onclick="gusaLikeMuziki('mimi_video_id')">
                        <i class="fas fa-heart" id="jumanne-like-icon-mimi" style="font-size: 20px; color: #ffffff; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></i>
                        <span id="jumanne-like-count-mimi" style="display: block; font-size: 10px; color: #ffffff; margin-top: 2px; font-weight: bold; font-family: sans-serif;">0</span>
                    </div>

                    <!-- Kitufe cha Comment cha Frosted Glass -->
                    <div style="text-align: center; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 8px; border-radius: 50%; width: 44px; height: 44px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
                        <i class="fas fa-comment-dots" style="font-size: 20px; color: #ffffff;"></i>
                    </div>

                    <!-- Kitufe cha Share cha Frosted Glass -->
                    <div style="text-align: center; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 8px; border-radius: 50%; width: 44px; height: 44px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
                        <i class="fas fa-share" style="font-size: 18px; color: #ffffff;"></i>
                    </div>

                    <!-- Mduara wa Muziki unaozunguka kwa CSS Keyframes -->
                    <div class="jumanne-vinyl-disc" style="width: 38px; height: 38px; border-radius: 50%; background: radial-gradient(circle, #222 25%, #111 30%, #000 70%); border: 3px solid rgba(255,255,255,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; animation: mzungukoWaVinyl 4s linear infinite;">
                        <i class="fas fa-music" style="color: #00e676; font-size: 11px;"></i>
                    </div>

                </div>

            </div>

            <style>
                @keyframes mzungukoWaVinyl {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        console.log("📹 Premium UI: Kadi nzima ya kuvutia yenye Frosted Glass overlays imekamilika!");
    } catch (err) { console.error("Mkwamo wa kuchora kadi ya video:", err); }
}
// ==========================================================================
// JUMANNETOK TZ - MASTER EDGE ENGINE (KIPANDE CHA 5 - 2-MIN LOCAL RAM DEBOUNCE GATE)
// ==========================================================================

// IV. MTEGO WA RAM: LIKES PROCESSING CHENYE DEBOUNCE YA DAKIKA 2 KAMILI [A]
function gusaLikeMuziki(videoId) {
    const likeIcon = document.getElementById(`jumanne-like-icon-${videoId}`);
    const likeCount = document.getElementById(`jumanne-like-count-${videoId}`);
    if (!likeIcon || !likeCount) return;

    let idadiSasa = parseInt(likeCount.innerText);

    if (!kikapuRAM_Likes[videoId]) {
        // 🔥 OPTIMISTIC UPDATE: Washa Like kioone sekunde sifuri! [A]
        kikapuRAM_Likes[videoId] = 1; 
        idadiSasa += 1;
        likeCount.innerText = idadiSasa;
        likeIcon.style.color = "#ff5252"; 
        likeIcon.style.transform = "scale(1.3)";
        setTimeout(() => { likeIcon.style.transform = "scale(1)"; }, 200);

        console.log("❤️ RAM Buffer: Like ipo RAM sasa. Inasubiri dakika 2 za chujio la dharura...");

        // Washa saa ya siri ya dharura ya DAKIKA 2 (120,000 milisekunde) [A]
        timersZaKughairiDebounce[`like_${videoId}`] = setTimeout(() => {
            fungaMuamalaWaKuraIndexedDB(videoId, "like", 1);
            delete kikapuRAM_Likes[videoId];
            delete timersZaKughairiDebounce[`like_${videoId}`];
        }, 120000);

    } else {
        // 🔥 CANCEL SHIELD: Mtumiaji amegonga UNLIKE ndani ya dakika 2! [A]
        if (timersZaKughairiDebounce[`like_${videoId}`]) {
            clearTimeout(timersZaKughairiDebounce[`like_${videoId}`]); // Kuyeyusha muamala hewani! [A]
            delete timersZaKughairiDebounce[`like_${videoId}`];
            console.log("🛡️ Debounce Guard: Muamala wa Like umefutwa RAM, IndexedDB imesalia salama!");
        }

        delete kikapuRAM_Likes[videoId];
        idadiSasa -= 1; 
        likeCount.innerText = idadiSasa;
        likeIcon.style.color = "#ffffff"; 
    }
}

// V. MTEGO WA RAM: FOLLOW PROCESSING CHENYE DEBOUNCE YA DAKIKA 2 KAMILI [A]
function gusaFollowMuziki(artistId) {
    const followBtn = document.getElementById("jumanne-follow-btn-mimi");
    const followTxt = document.getElementById("jumanne-follow-text-mimi");
    const followIcon = document.getElementById("jumanne-follow-icon-mimi");
    if (!followBtn || !followTxt || !followIcon) return;

    if (!kikapuRAM_Followers[artistId]) {
        // 🔥 OPTIMISTIC UPDATE: Geuza kuwa Unfollow kioone sekunde sifuri! [A]
        kikapuRAM_Followers[artistId] = 1; 
        followTxt.innerText = "Unfollow";
        followBtn.style.background = "#333333"; 
        followBtn.style.color = "#ffffff";
        followIcon.className = "fas fa-user-check";

        console.log("👤 RAM Buffer: Follow ipo RAM sasa. Inasubiri dakika 2 za chujio la dharura...");

        // Washa saa ya siri ya dharura ya DAKIKA 2 [A]
        timersZaKughairiDebounce[`follow_${artistId}`] = setTimeout(() => {
            fungaMuamalaWaKuraIndexedDB(artistId, "follow", 1);
            delete kikapuRAM_Followers[artistId];
            delete timersZaKughairiDebounce[`follow_${artistId}`];
        }, 120000);

    } else {
        // 🔥 CANCEL SHIELD: Mtumiaji amegonga UNFOLLOW ndani ya dakika 2! [A]
        if (timersZaKughairiDebounce[`follow_${artistId}`]) {
            clearTimeout(timersZaKughairiDebounce[`follow_${artistId}`]); // Futa muamala hewani upole! [A]
            delete timersZaKughairiDebounce[`follow_${artistId}`];
            console.log("🛡️ Debounce Guard: Muamala wa Follow umeyeyushwa RAM, diski imeachwa safi!");
        }

        delete kikapuRAM_Followers[artistId];
        followTxt.innerText = "Follow";
        followBtn.style.background = "#00e676"; 
        followBtn.style.color = "#000000";
        followIcon.className = "fas fa-plus-circle";
    }
}

function fungaMuamalaWaKuraIndexedDB(idKete, ainaYaKura, thamaniHesabu) {
    if (!dbJumanneEdgeCache) return;

    // Fungua muamala wa uandishi (readwrite) mlangoni mwa diski ya simu [A]
    const muamala = dbJumanneEdgeCache.transaction(["jumanne_pending_analytics"], "readwrite");
    const duka = muamala.objectStore("jumanne_pending_analytics");
    
    const funguoKura = `${ainaYaKura}_${idKete}`;
    const ombiDaka = duka.get(funguoKura);

    ombiDaka.onsuccess = function(e) {
        let dataZilizopo = e.target.result;

        if (!dataZilizopo) {
            dataZilizopo = {
                idKete: idKete,
                ainaYaKura: ainaYaKura,
                idadiKura: thamaniHesabu,
                muda_wa_kuanza: Date.now() // Saa halisi ya milisekunde ya safari ya mteja (Fixed Anchor) [A]
            };
        } else {
            dataZilizopo.idadiKura += thamaniHesabu;
        }

        // Lock data ndani ya duka la IndexedDB [A]
        duka.put(dataZilizopo, funguoKura);
        console.log(`💾 Disk Lock: Muamala wa ${ainaYaKura.toUpperCase()} umefungwa ndani ya IndexedDB salama.`);
        
        if (typeof kaguaMudaWaMzungukoWaDakika5 === "function") {
            kaguaMudaWaMzungukoWaDakika5(dataZilizopo, funguoKura);
        }
    };
}

// VII. MTAMBO UNAOKAGUA KAMA DAKIKA 5 ZIMETIMIA TANGU MGUSO WA KWANZA WA MTEJA [A]
function kaguaMudaWaMzungukoWaDakika5(dataKura, funguoKura) {
    if (!dataKura.muda_wa_kuanza) return;

    const mudaSasa = Date.now();
    const umbaliWaMuda = mudaSasa - dataKura.muda_wa_kuanza;
    
    // 🧠 DAKIKA 5 KAMILI ZIMEGEUZWA KUWA MILISEKUNDE KWA AJILI YA HESABU (5 * 60 * 1000 = 300,000 ms) [A]
    const DAKIKA_5_MS = 300000; 

    console.log(`⏱️ Time Tracker: Umbali wa muda uliopita kwenye diski ya simu: ${Math.round(umbaliWaMuda / 1000)} sekunde.`);

    // Dirisha la dakika 5 zikitimia kamili kitaifa, lipua seva kiume! [A]
    if (umbaliWaMuda >= DAKIKA_5_MS) {
        console.log("🎯 Dynamic Trigger: Dakika 5 zimetimia! Amsha Seva ya Simu Prosesa kusafisha mzigo...");
        lipuaMiamalaYoteKwendaSevaKiume();
    }
}

// VIII. 🔥 SEVA YA SIMU PROSESA: INAKUSANYA MA-ID TOFAUTI KWENYE CPU YA SIMU [A]
function lipuaMiamalaYoteKwendaSevaKiume() {
    if (!dbJumanneEdgeCache) return;

    // Fungua muamala mwepesi wa kusoma tu (readonly) kulinda RAM ya simu [A]
    const muamala = dbJumanneEdgeCache.transaction(["jumanne_pending_analytics"], "readonly");
    const duka = muamala.objectStore("jumanne_pending_analytics");
    const ombiCursor = duka.openCursor();

    // Kikapu cha dhahabu kilichopangwa kwa ma-ID tofauti tofauti ya kila video na msanii [A]
    let kikapuMuzikiKuu = {
        likes: {},
        followers: {}
    };

    let kunaDataYaKutuma = false;

    ombiCursor.onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            const data = cursor.value;
            kunaDataYaKutuma = true;

            // 🧠 CPU PROCESSOR: Tenganisha Like za Singeli na Follows za ucheshi kitalamu hapa! [A]
            if (data.ainaYaKura === "like") {
                kikapuMuzikiKuu.likes[data.idKete] = data.idadiKura;
            } else if (data.ainaYaKura === "follow") {
                kikapuMuzikiKuu.followers[data.idKete] = data.idadiKura;
            }

            cursor.continue(); // Songa mbele kwenye ID inayofuata kwenye diski ya simu [A]
        } else {
            // Mzunguko wa CPU ukimaliza kusoma ma-ID yote, lipua mtandao wa XHR kwenda seva kuu ya bonde.js [A]
            if (kunaDataYaKutuma) {
                tupaKikapuKuuSevaYaBonde(kikapuMuzikiKuu);
            }
        }
    };
}

// IX. INJINI YA XHR ILIYOVIKWA SAINI YA SIRI YA CRYPTO KUZUIA UDŪKUZI [A]
async function tupaKikapuKuuSevaYaBonde(kikapuPayload) {
    const tokenKuu = localStorage.getItem("jumannetok_jwt_token");
    const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://jumannetok.com';

    // Geuza data ya kura kuwa maneno mnyofu (Stringify) kwa ajili ya kupiga hesabu [A]
    const dataString = JSON.stringify(kikapuPayload);

    let sainiYaChuma = "";

    try {
        // 🧠 MTAMBO WA CRYPTO WA NDANI YA CPU YA SIMU (SUBTLECRYPTO API) [A]
        // Inatumia ufunguo ule ule wa siri uliopo seva ya ndani kupika saini [A]
        const encoder = new TextEncoder();
        const ufunguoData = encoder.encode("JumanneTokTZ_Usalama_Chuma_2026");
        const payloadData = encoder.encode(dataString);

        // Geuza neno la siri kuwa ufunguo rasmi wa ki-hardware wa HMAC SHA-256 [A]
        const cryptoKey = await crypto.subtle.importKey(
            "raw", ufunguoData, 
            { name: "HMAC", hash: { name: "SHA-256" } }, 
            false, ["sign"]
        );

        // Piga saini ya siri ya milisekunde 0.1 ya CPU ya kila simu ya mteja [A]
        const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, payloadData);
        
        // Badilisha herufi za saini kwenda kwenye muundo wa namba na herufi za Hex (c4ca42...) [A]
        sainiYaChuma = Array.from(new Uint8Array(signatureBuffer))
            .map(b => b.toString(16).padStart(2, '0')).join('');

        console.log("🛡️ Crypto Guard: Saini ya siri ya kidijitali imeshapikwa na CPU ya simu!");

    } catch (errCrypto) {
        console.warn("⚠️ SubtleCrypto haijakaa sawa au ipo HTTP, inatumia fallback check...", errCrypto);
        sainiYaChuma = "fallback_jumanne_no_crypto_lock";
    }

    const xhrMiamala = new XMLHttpRequest();
    
    xhrMiamala.onreadystatechange = function() {
        if (xhrMiamala.readyState === 4 && (xhrMiamala.status === 200 || xhrMiamala.status === 201)) {
            try {
                const jibuSeva = JSON.parse(xhrMiamala.responseText);
                if (jibuSeva.success) {
                    console.log("🎉 Mfumo Umetia Goli! Data zimesajiliwa MongoDB Atlas salama.");
                    safishaDukaLaKuraIndexedDBSalama();
                }
            } catch (err) { console.error(err); }
        }
    };

    xhrMiamala.open("POST", `${BASE_URL}/api/analytics/batch-sync`, true);
    xhrMiamala.setRequestHeader("Content-Type", "application/json");
    
    // 🔥 MKAKATI MKUU: Pachika ile saini ya chuma kama stika ya usalama kwenye Header! [A]
    xhrMiamala.setRequestHeader("X-Jumanne-Signature", sainiYaChuma);
    
    if (tokenKuu) xhrMiamala.setRequestHeader("Authorization", `Bearer ${tokenKuu}`);
    
    // Rusha mzigo mzima mtandaoni ukiwa umepigwa kufuli rasmi [A]
    xhrMiamala.send(dataString);
}


// X. 🔥 SULUHISHO: MTAMBO WA USACFISHAJI ULIOFUNGWA TRY-CATCH KUZUIA DOMEXCEPTION [A]
function safishaDukaLaKuraIndexedDBSalama() {
    if (!dbJumanneEdgeCache) {
        // Kama variable ipo tupu kwa dharura, ifungue upya database haraka kimyakimya [A]
        const ombiFunguaUpya = indexedDB.open("JumanneTok_Local_Cache", 1);
        ombiFunguaUpya.onsuccess = function(e) {
            dbJumanneEdgeCache = e.target.result;
            safishaDukaLaKuraIndexedDBSalama(); // Piga upya usafishaji baada ya sekunde 0! [A]
        };
        return;
    }

    try {
        if (!dbJumanneEdgeCache.objectStoreNames.contains("jumanne_pending_analytics")) return;

        const muamalaFuta = dbJumanneEdgeCache.transaction(["jumanne_pending_analytics"], "readwrite");
        const duka = muamalaFuta.objectStore("jumanne_pending_analytics");
        
        const ombiFutaZote = duka.clear(); // Safisha kabisa duka lote libaki tupu safi! [A]

        ombiFutaZote.onsuccess = function() {
            console.log("🛡️ Garbage Collection: Seva ya simu imesafishwa na ipo tupu kwa mzunguko unaofuata.");
        };
    } catch (dhorubaDOM) {
        // Mtego unaokamata dhoruba zote za DOMException na kuzitupa jalalani upole [A]
        console.error("🛡️ DOMException Guard Imeshtuka kitalamu:", dhorubaDOM.message);
    }
}
// ==========================================================================
// JUMANNETOK TZ - MASTER EDGE ENGINE (KIPANDE CHA 10 - BACKGROUND VIDEO UPLOAD GATEWAY)
// ==========================================================================

// XI. INJINI YA SIRI YA BACKGROUND UPLOAD YA VIDEO (STEP 3 TO INDEX GATEWAY) [A]
function kaguaNaUwasheUploadYaNyumaYaPazia() {
    if (!dbJumanneEdgeCache) return;

    const muamala = dbJumanneEdgeCache.transaction(["jumannetok_feed_cache"], "readonly");
    const duka = muamala.objectStore("jumannetok_feed_cache");
    const ombiDaka = duka.get("jumanne_current_upload_draft");

    ombiDaka.onsuccess = function(e) {
        const data = e.target.result;
        
        // Kama amegundua muamala wa video uliowekwa kete ya "isubiri" [A]
        if (data && data.haliYaUploadNyuma === "isubiri" && data.videoBlobData) {
            console.log("🚀 Background Upload: Mzigo wa video umegundulika foldani...");
            
            // Washa upao wa juu wa asilimia ya kijani kioone [A]
            const topZone = document.getElementById("jumanne-top-upload-zone");
            if (topZone) topZone.style.display = "block";

            // Chora ile kadi nzima ya video kioone mubashara sekunde sifuri! [A]
            choraKadiYaVideoYaMtejaMubashara(data);

            const mrijaWaNyuma = new FormData();
            mrijaWaNyuma.append("video_file", data.videoBlobData);
            mrijaWaNyuma.append("video_category", data.video_category);
            mrijaWaNyuma.append("video_type", data.video_type);
            mrijaWaNyuma.append("video_caption", data.video_caption);

            mtafutajiMkuuWaUploadIndex = new AbortController();
            
            // Injini ya mtandao inayopeleka video Node.js mseto na Python ya nyuma [A]
            lipuaBackgroundVideoXHRSeva(mrijaWaNyuma);
        }
    };
}

// XII. XHR YA NETWOK INAYOSUKUMA VIDEO LIVE KWENYE SEVA YA NYUMA [A]
function lipuaBackgroundVideoXHRSeva(formDataMrija) {
    const progressBarIndex = document.getElementById("jumanne-top-progress-bar");
    const statusTextIndex = document.getElementById("jumanne-top-status-txt");
    const topZoneBox = document.getElementById("jumanne-top-upload-zone");
    const tokenKuu = localStorage.getItem("jumannetok_jwt_token");
    
    const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://jumannetok.com';

    const xhrVideo = new XMLHttpRequest();
    xhrMsaidiziWaGlobal = xhrVideo;

    xhrVideo.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
            const asilimiaYaUkweli = Math.round((e.loaded / e.total) * 100);
            if (progressBarIndex) progressBarIndex.style.width = `${asilimiaYaUkweli}%`;
            if (statusTextIndex) statusTextIndex.innerText = `⏳ Inapakia kipaji chako nyuma ya pazia: ${asilimiaYaUkweli}%`;
            
            if (asilimiaYaUkweli === 100) {
                // 🔥 SULUHISHO: Weka ule ujumbe thabiti wa dakika 40 na dakika 10 tulizozipanga mkuu wao! [A]
                if (statusTextIndex) statusTextIndex.innerText = `🚀 Mzigo umetua Seva! Node.js inakusanya dakika 40 kabla ya kumkabidhi Python asafishe na kufinya video...`;
            }
        }
    });

    xhrVideo.onreadystatechange = function() {
        if (xhrVideo.readyState === 4) {
            if (xhrVideo.status === 200 || xhrVideo.status === 201) {
                try {
                    const responseData = JSON.parse(xhrVideo.responseText);
                    if (responseData.success) {
                        // Safisha duka la video diski ya simu isijae takataka, kazi imeisha! [A]
                        if (!dbJumanneEdgeCache) return;
                        const muamalaFuta = dbJumanneEdgeCache.transaction(["jumannetok_feed_cache"], "readwrite");
                        muamalaFuta.objectStore("jumannetok_feed_cache").delete("jumanne_current_upload_draft");

                        if (topZoneBox) topZoneBox.style.display = "none";
                        
                        const uploadCard = document.getElementById("jumanne-background-uploading-card");
                        if (uploadCard) uploadCard.remove();
                        
                        // Amsha kile kibandiko cha kisanii cha dhahabu chini ya skrini (Toast Victory) [A]
                        const victoryToast = document.getElementById("jumanne-toast-victory");
                        if (victoryToast) {
                            victoryToast.style.setProperty("display", "flex", "important");
                            setTimeout(() => {
                                victoryToast.style.opacity = "0";
                                setTimeout(() => { 
                                    victoryToast.style.display = "none";
                                    victoryToast.style.opacity = "1";
                                    location.reload(); 
                                }, 300);
                            }, 4000);
                        }
                    }
                } catch(e) { location.reload(); }
            }
        }
    };

    xhrVideo.open("POST", `${BASE_URL}/api/videos/upload`, true);
    if (tokenKuu) xhrVideo.setRequestHeader("Authorization", `Bearer ${tokenKuu}`);
    xhrVideo.send(formDataMrija); 
}

// ==========================================================================
// JUMANNETOK TZ - CORE FRONT-END VIDEO STREAMING REQUESTER (INDEX.HTML)
// ==========================================================================

function ombaNaUchezeVideoKutokaSevaYaRender() {
    console.log("[JumanneTok Video Client] 📡 Mtambo unaanza kuomba video kutoka kwa Custom videodb.js...");

    const videoPlayerElement = document.getElementById("jumanne-feed-player-main");
    if (!videoPlayerElement) {
        console.error("❌ Mkwamo wa Kioo: Element ya 'video player' haijapatikana kwenye HTML!");
        return;
    }

    // A. WEKA BASE URL KULINGANA NA MAZINGIRA YA SEVA YETU YA RENDER
    const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://jumannedb-video-kernel.onrender.com';
    const streamEndpointUrl = `${BASE_URL}/api/v1/videos/stream-test`;

    // B. MTAMBO MKUU WA BARE-METAL XHR VIDEO Persistance
    const xhrVideoRequester = new XMLHttpRequest();
    xhrVideoRequester.open("GET", streamEndpointUrl, true);
    
    // Pachika ile stika ya chuma ya usalama kuzuia ma-robot mlangoni pa seva
    xhrVideoRequester.setRequestHeader("X-Jumanne-Edge-Lock", "CDN_HYDRATION_ACTIVE");
    
    // Swichi ya Low-Level ya ki-hardware inayolazimisha kivinjari kisome video kama mrija wa stream (Blob)
    xhrVideoRequester.responseType = "blob";

    xhrVideoRequester.onreadystatechange = function () {
        if (xhrVideoRequester.readyState === 4) {
            console.log(`[JumanneTok Video Client] 📡 Mawimbi yamerudi kutoka Render! HTTP Status: ${xhrVideoRequester.status}`);
            
            if (xhrVideoRequester.status === 200 || xhrVideoRequester.status === 206) {
                try {
                    // C. MUUJIZA WA UNYOYA: Geuza bando ghafi lililotua kutoka seva kuwa URL ya binary
                    const videoBlobReceived = xhrVideoRequester.response;
                    const liveVideoObjectURL = URL.createObjectURL(videoBlobReceived);
                    
                    // Pachika mrija wa video kwenye kioo cha mteja mubashara sekunde ya sifuri
                    videoPlayerElement.src = liveVideoObjectURL;
                    
                    // Washa video icheze yenyewe bila ku-buffer na bila lag ya kijinga mtaani
                    videoPlayerElement.play()
                        .then(() => {
                            console.log("✅ USHINDI WA KIBILIONEA! Mrija wa video kutoka videodb.js unamwaga moto kioone!");
                        })
                        .catch((playError) => {
                            console.warn("⚠️ Kivinjari kimepiga breki ya autoplay, inasubiri mguso wa mteja:", playError.message);
                        });

                } catch (errBlob) {
                    console.error("❌ Mkwamo wa kutengeneza Object URL upande wa client:", errBlob.message);
                }
            } else {
                console.error(`❌ Hitilafu ya Seva Kuu: Mrija wa video umegoma kurejesha Bytes. Code: ${xhrVideoRequester.status}`);
            }
        }
    };

    xhrVideoRequester.onerror = function () {
        console.error("❌ Dhoruba Kuu ya Mtandao: Seva haipatikani kabisa hewani Render au internet imekata!");
    };

    // Amsha mrija wa mtandao na kurusha request kiume
    xhrVideoRequester.send();
}

// XIII. AMRE YA CHUMA YA KUWASHA INJINI MARA TU KIOO KINAPOFUNGUKA (PROD AUTOMATION)
window.addEventListener("DOMContentLoaded", () => {
    // 1. Amsha duka la IndexedDB na walinzi wote wa kura tulioyasisi mda ule
    if (typeof amshaDukaLaHomeFeedLocal === "function") {
        amshaDukaLaHomeFeedLocal();
    }
    
    // 2. 🔥 PIGO LA USHINDI: Omba na ucheze video kutoka kwenye database yetu ya videodb.js sekunde iyo hiyo!
    ombaNaUchezeVideoKutokaSevaYaRender();
});
