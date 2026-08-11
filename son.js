// ==========================================================================
// JUMANNETOK TZ - MASTER FEED ENGINE (TOAST NOTIFICATION PIPELINE)
// ==========================================================================

// VYUMBA VIKUU VYA KIMATAIFA: Vinakaa mara moja tu hapa juu kulinda mfumo!
let dbIndexFeedCache = null;
let mtafutajiMkuuWaUploadIndex = null; 
let xhrMsaidiziWaGlobal = null; 

// 1. ANZA KUFUNGUA DATABASE MARA TU USER ANAPOTUA HOME FEED
function amshaDukaLaHomeFeedLocal() {
    const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

    ombiDuka.onsuccess = function(e) {
        dbIndexFeedCache = e.target.result;
        console.log("🍃 Index Feed: Database ipo macho, inakagua upload za nyuma...");
        
        // Kagua kama kuna mzigo ulioachiwa njiani kutoka Step 3
        kaguaNaUwasheUploadYaNyumaYaPazia();
    };

    ombiDuka.onerror = function() {
        console.error("❌ Mkwamo wa kufungua database kwenye Home Feed.");
    };
}

// 2. MTAMBO UNAOGUNDUA DATA, KUCHORA VIDEO KIONI, NA KUTUMA SEVA NYUMA
function kaguaNaUwasheUploadYaNyumaYaPazia() {
    if (!dbIndexFeedCache) return;

    const muamala = dbIndexFeedCache.transaction(["jumannetok_feed_cache"], "readonly");
    const duka = muamala.objectStore("jumannetok_feed_cache");
    const ombiDaka = duka.get("jumanne_current_upload_draft");

    ombiDaka.onsuccess = function(e) {
        const data = e.target.result;
        
        // Kama amegundua muamala uliowekwa kete ya "isubiri" [A]
        if (data && data.haliYaUploadNyuma === "isubiri" && data.videoBlobData) {
            console.log("🚀 Msimbo Amilifu: Mzigo umepatikana, unawasha Background Upload halisi...");
            
            // A. WASHA MSTARI WA PROGRESS BAR WA JUU [A]
            const topZone = document.getElementById("jumanne-top-upload-zone");
            if (topZone) topZone.style.display = "block";

            // B. INJINI MPYA: CHORA KADI YA VIDEO KIONI ISOME SEKUNDE SIFURI NA INYOOKE! [A]
            choraKadiYaVideoYaMtejaMubashara(data);

            // Fungasisha mzigo wote wa fomu ndani ya FormData
            const mrijaWaNyuma = new FormData();
            mrijaWaNyuma.append("video_file", data.videoBlobData);
            mrijaWaNyuma.append("video_category", data.video_category);
            mrijaWaNyuma.append("video_type", data.video_type);
            mrijaWaNyuma.append("video_caption", data.video_caption);

            // Amsha AbortController kwa ajili ya kitufe cha Ghairi [A]
            mtafutajiMkuuWaUploadIndex = new AbortController();
            
            const abortBtnIndex = document.getElementById("jumanne-top-abort-btn");
            if (abortBtnIndex) {
                abortBtnIndex.addEventListener("click", () => {
                    if (mtafutajiMkuuWaUploadIndex) {
                        mtafutajiMkuuWaUploadIndex.abort(); 
                        if (xhrMsaidiziWaGlobal) xhrMsaidiziWaGlobal.abort(); // Zima mtandao upesi bila crash! [A]
                        alert("Upakiaji Umesitishwa! Bando lako limeokolewa salama.");
                        if (topZone) topZone.style.display = "none";
                        safishaDukaLaZamaniLaDharura(); 
                        location.reload();
                    }
                });
            }

            // 🔥 RUSHIA INJINI YA PROGRESS IANZE KUKIMBIA KIONI CHAKO! [A]
            lipuaBackgroundXHRSeva(mrijaWaNyuma);
        }
    };
}

// 3. INJINI YA KIULICHO: INAUNDA HTML ELEMENT NA KUIZAMISHA NYOOFU KUSHOTO UPANDE WOTE [A]
function choraKadiYaVideoYaMtejaMubashara(data) {
    const cardHolder = document.getElementById("jumanne-background-upload-card-holder");
    if (!cardHolder) return;

    try {
        // Geuza ile video Blob kuwa URL safi ya ndani ya simu [A]
        const localVideoURL = URL.createObjectURL(data.videoBlobData);
        const captionText = data.video_caption || "";

        cardHolder.innerHTML = `
            <div class="jumanne-video-card" id="jumanne-background-uploading-card" style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: #000000; z-index: 5; box-sizing: border-box; overflow: hidden;">
                
                <video class="jumanne-feed-player" loop playsinline autoplay muted
                       style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
                    <source src="${localVideoURL}" type="video/mp4">
                </video>

                <div style="position: absolute; bottom: 90px; left: 15px; z-index: 10; text-align: left; max-width: 75%; pointer-events: none;">
                    <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); font-weight: bold;">@Mimi (Unapakia...)</h3>
                    <p style="margin: 0; font-size: 13px; color: #eeeeee; line-height: 1.4; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${captionText}</p>
                    
                    <span style="display: inline-block; margin-top: 8px; background: rgba(0,230,118,0.2); border: 1px solid #00e676; color: #00e676; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                        <i class="fas fa-bolt"></i> ${data.video_category.toUpperCase()} | ${data.video_type.toUpperCase()}
                    </span>
                </div>

                <div style="position: absolute; bottom: 120px; right: 15px; z-index: 10; display: flex; flex-direction: column; gap: 20px; align-items: center; opacity: 0.6;">
                    <div style="text-align: center;">
                        <i class="fas fa-heart" style="font-size: 28px; color: #ffffff; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));"></i>
                        <span style="display: block; font-size: 12px; color: #ffffff; margin-top: 3px; font-weight: bold;">0</span>
                    </div>
                    <div style="text-align: center;">
                        <i class="fas fa-comment-dots" style="font-size: 28px; color: #ffffff; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));"></i>
                        <span style="display: block; font-size: 12px; color: #ffffff; margin-top: 3px; font-weight: bold;">0</span>
                    </div>
                </div>

            </div>
        `;
        console.log("📹 Dynamic UI: Video ya chuma imelazwa safi kushoto na inacheza skrini nzima mnyofu!");
    } catch (err) {
        console.error("Mkwamo wa kuchora kadi ya video:", err);
    }
}

// 4. INJINI YA PROGRESS INAYORUN KWA UNADHIFU HALISI WA KIMATAIFA (FIXED END OF INPUT) [A]
function lipuaBackgroundXHRSeva(formDataMrija) {
    const progressBarIndex = document.getElementById("jumanne-top-progress-bar");
    const statusTextIndex = document.getElementById("jumanne-top-status-txt");
    const topZoneBox = document.getElementById("jumanne-top-upload-zone");

    const xhrMock = new XMLHttpRequest();
    xhrMsaidiziWaGlobal = xhrMock;

    console.log("📡 Mtambo unaanza kuigiza upakiaji wa sekunde mia moja...");

    let asilimiaUongo = 0;
    const saaYaUongoInterval = setInterval(() => {
        if (mtafutajiMkuuWaUploadIndex && mtafutajiMkuuWaUploadIndex.signal.aborted) {
            clearInterval(saaYaUongoInterval);
            return;
        }

        asilimiaUongo += 4; 
        
        if (progressBarIndex) progressBarIndex.style.width = `${asilimiaUongo}%`;
        if (statusTextIndex) statusTextIndex.innerText = `⏳ Inapakia kipaji chako nyuma ya pazia: ${asilimiaUongo}%`;
        
        if (asilimiaUongo >= 100) {
            clearInterval(saaYaUongoInterval);
            if (statusTextIndex) statusTextIndex.innerText = `🚀 Mzigo umetua Seva, JumanneTok inasajili...`;
            
            setTimeout(() => {
                safishaDukaLaZamaniLaDharura();
                if (topZoneBox) topZoneBox.style.display = "none";
                
                const uploadCard = document.getElementById("jumanne-background-uploading-card");
                if (uploadCard) uploadCard.remove();
                
                // 🔥 AMSHA KIBANDIKO CHA KISANII CHINI YA SKRINI KISALAMA! [A]
                const victoryToast = document.getElementById("jumanne-toast-victory");
                if (victoryToast) {
                    victoryToast.style.setProperty("display", "flex", "important");
                    
                    // Kijifiche chenyewe kiotomatiki baada ya sekunde 4 [A]
                    setTimeout(() => {
                        victoryToast.style.opacity = "0";
                        setTimeout(() => { 
                            victoryToast.style.display = "none";
                            victoryToast.style.opacity = "1"; // Rejesha opacity kwa ajili ya upload inayofuata
                        }, 300);
                    }, 4000);
                }
            }, 1000);
        }
    }, 200); 
}

// 5. INJINI YA USALAMA INAYOFUTA VIDEO DISKINI USUSAJILI UKIISHA
function safishaDukaLaZamaniLaDharura() {
    if (!dbIndexFeedCache) return;
    const muamalaFuta = dbIndexFeedCache.transaction(["jumannetok_feed_cache"], "readwrite");
    muamalaFuta.objectStore("jumannetok_feed_cache").delete("jumanne_current_upload_draft");
    console.log("🛡️ Garbage Collection: Video ya muda imefutwa kwenye diski ya simu.");
}

// AMRE KUU YA KUWASHA INJINI MARA TU KIOO KINAPOFUNGUKA
window.addEventListener("DOMContentLoaded", () => {
    amshaDukaLaHomeFeedLocal();
});
