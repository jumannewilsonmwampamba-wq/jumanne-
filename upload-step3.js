let dbIndexedAkiba = null;
// 1. ANZA KUFUNGUA DATABASE KIVINJARI KIKIFUNGUKA TU
function amshaDukaLaStep3Local() {
    const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

    ombiDuka.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("jumannetok_feed_cache")) {
            db.createObjectStore("jumannetok_feed_cache", { keyPath: "id" });
        }
    };

    ombiDuka.onsuccess = function(e) {
        dbIndexedAkiba = e.target.result;
        console.log("✅ Step 3: Database imefunguka salama!");
        
        // Washa video ya preview ya juu upesi mbele ya macho ya msanii
        vutaNaUchezeVideoYaMwisho();
        
        // Amsha injini ya kuhesabu maneno na rangi 4 za bendera ya TZ
        amshaMtegoWaHesabuYaManenoNaTags();
    };

    ombiDuka.onerror = function() {
        console.error("❌ Mkwamo! Kivinjari kimegoma kufungua IndexedDB Step 3.");
    };
}

// 2. MTAMBO WA KUVUTA BLOB YA STEP 1 NA KUICHEZA PREVIEW JUU
function vutaNaUchezeVideoYaMwisho() {
    if (!dbIndexedAkiba) return;

    const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
    const duka = muamala.objectStore("jumannetok_feed_cache");
    const ombiDaka = duka.get("jumanne_current_upload_draft");

    ombiDaka.onsuccess = function(e) {
        const data = e.target.result;
        
        // Vuta ile raw Blob nyoofu tuliyoisave tangu Step 1
        if (data && data.videoBlobData) {
            const playerStep3 = document.getElementById("jumanne-local-preview-player-step3");
            try {
                const URLyaVideoStep3 = URL.createObjectURL(data.videoBlobData);
                if (playerStep3) {
                    playerStep3.src = URLyaVideoStep3;
                    playerStep3.play().catch(() => {});
                }
            } catch (err) { console.error(err); }
        }
    };
}
// 3. INJINI YA HESABU YA MANENO CHENYE RANGI NNE ZA BENDERA YA TANZANIA
function amshaMtegoWaHesabuYaManenoNaTags() {
    const captionInput = document.getElementById("jumanne-video-caption");
    const wordCounter = document.getElementById("jumanne-word-counter");
    const tagsCounter = document.getElementById("jumanne-tags-counter");

    if (!captionInput || !wordCounter || !tagsCounter) return;

    // Kusikiliza uandishi wa kila herufi kwa adabu [A]
    captionInput.addEventListener("input", () => {
        const maandishiGhafi = captionInput.innerText;
        const manenoKazi = maandishiGhafi.trim().split(/\s+/).filter(n => n.length > 0);
        const idadiYaManeno = manenoKazi.length;

        // 🔥 LAZIMISHA BENDERA YA TAIFA KWA 'IMPORTANT' KINGUVU KWENYE KIBANDIKO! [A]
        if (idadiYaManeno <= 20) {
            wordCounter.style.setProperty("color", "#00e676", "important"); // 🟩 KIJANI (1 - 20)
        } else if (idadiYaManeno > 20 && idadiYaManeno <= 40) {
            wordCounter.style.setProperty("color", "#ffd700", "important"); // 🟨 NJANO (21 - 40)
        } else if (idadiYaManeno > 40 && idadiYaManeno < 50) {
            wordCounter.style.setProperty("color", "#00b0ff", "important"); // 🟦 BLUU (41 - 49)
        } else if (idadiYaManeno >= 50) {
            wordCounter.style.setProperty("color", "#000000", "important"); // ⬛ NYEUSI (50)
            wordCounter.style.setProperty("background-color", "#ff5252", "important"); // Background ya onyo [A]
        }

        if (idadiYaManeno < 50) {
            wordCounter.style.background = "none";
        }

        wordCounter.innerText = `Maneno: ${idadiYaManeno} / 50`;

        // HESABU YA MA-HASHTAG (TAGS: MAX 8) [A]
        const tagsZilizopo = manenoKazi.filter(m => m.startsWith("#"));
        tagsCounter.innerText = `Tags: ${tagsZilizopo.length} / 8`;
        tagsCounter.style.setProperty("color", tagsZilizopo.length > 8 ? "#ff5252" : "#666", "important");
    });

    // Kuzuia uandishi kinguvu ukifikisha kikomo cha maneno 50 [A]
    captionInput.addEventListener("keydown", (e) => {
        const manenoKazi = captionInput.innerText.trim().split(/\s+/).filter(n => n.length > 0);
        if (manenoKazi.length >= 50 && e.key === " " && e.key !== "Backspace" && e.key !== "Delete") {
            e.preventDefault();
            alert("🛑 Kikomo cha Taifa! Maelezo ya video hayapaswi kuzidi maneno 50.");
        }
    });
}
// ==========================================================================
// JUMANNETOK TZ - CONTROLLER YA HATUA YA 3 (KIPANDE CHA 4 - THE REDIRECT BOMB)
// ==========================================================================

// 4. INJINI INAYOFUNGA DATA NA KUKUHAMISHA INDEX.HTML PAPO HAPO
function amshaMtamboWaKutumaVideo() {
    const btnPublish = document.getElementById("jumanne-final-publish-btn");
    const captionInput = document.getElementById("jumanne-video-caption");

    if (!btnPublish || !captionInput) return;

    btnPublish.addEventListener("click", () => {
        const maelezoSafi = captionInput.innerText.trim();
        const maneno = maelezoSafi.split(/\s+/).filter(n => n.length > 0);
        const tagsZilizopo = maneno.filter(m => m.startsWith("#"));

        // 🧠 VALIDATION: LAZIMISHA MSANII AJAZE VYOTE VIWILI KWANZA!
        if (!maelezoSafi) { 
            alert("Mkwamo! Tafadhali andika maelezo (caption) ya video yako kwanza kabla ya kuchapisha."); 
            return; 
        }
        
        if (tagsZilizopo.length === 0) {
            alert("Mkwamo wa Tags! Tafadhali weka angalau Tag moja (kama #Singeli au #Comedy) ili video yako ipate jamii sahihi mtaani!");
            return;
        }

        if (maneno.length > 50) { alert("Umezidi kikomo cha maneno 50!"); return; }
        if (tagsZilizopo.length > 8) { alert("Umezidi kikomo cha tags 8!"); return; }

        // Vuta data za Hatua ya 2 kutoka sessionStorage
        const dataStep2Ghafi = sessionStorage.getItem("jumannetok_upload_step2");
        if (!dataStep2Ghafi) { 
            alert("Data za Step 2 hazipo! Rudi nyuma kachague aina ya kipaji."); 
            return; 
        }
        const dataStep2 = JSON.parse(dataStep2Ghafi);

        // Kagua kama database ya ndani ipo tayari kabla ya kuandika diski
        if (!dbIndexedAkiba) {
            console.warn("⚠️ Database haijafunguka vizuri, tunakulazimisha kuvuka kwa dharura!");
            window.location.href = "index.html";
            return;
        }

        // Fungua muamala wa kuandika diski ya ndani ya simu (readwrite) upesi
        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
        const duka = muamala.objectStore("jumannetok_feed_cache");
        const ombiDaka = duka.get("jumanne_current_upload_draft");

        ombiDaka.onsuccess = function(e) {
            const data = e.target.result;
            
            if (data) {
                // 🔥 FUNGASHA DATA ZOTE PAMOJA KWENYE DISKI ILI INDEX.HTML IZIKUTE KULE MBELE!
                data.video_category = dataStep2.ainaYaKipaji;
                data.video_type = dataStep2.utaratibuWaVideo;
                data.video_caption = maelezoSafi;
                data.haliYaUploadNyuma = "isubiri"; // Kete ya siri inayoiambia index.html iamshe upload huko mbele
                
                // Laza mzigo upya ndani ya IndexedDB
                const ombiHifadhiUpya = duka.put(data);

                // MTEGO WA USHINDI: Ikishakaa tu kwenye diski ya simu, amuru uhamisho papo hapo kwa sekunde 0!
                ombiHifadhiUpya.onsuccess = function() {
                    console.log("📦 Data zote zimefungashwa vizuri. Mtambo unakuhamisha ukurasa wa mbele...");
                    
                    // Safisha sessionStorage ya Hatua ya 2 haraka kulinda RAM
                    sessionStorage.removeItem("jumannetok_upload_step2");

                    // 🔥 MRUSHE MSANII MOJA KWA MOJA KWENDA VIDEO FEED YA INDEX.HTML MAPEMA LEO LEO!
                    window.location.href = "index.html"; 
                };

                // Hata kukitokea mkwamo wa kuandika diski, usimzuie msanii mpepeleke mbele asikwame
                ombiHifadhiUpya.onerror = function() {
                    window.location.href = "index.html";
                };
            } else {
                window.location.href = "index.html";
            }
        };
    });
}

function washaMitungiYoteMwishoni() { 
    amshaMtamboWaKutumaVideo();
}

// 5. TIMU YOTE INAAMSHA ENGINE IKIFUNGUKA
window.addEventListener("DOMContentLoaded", () => {
    amshaDukaLaStep3Local();
    washaMitungiYoteMwishoni(); // 🔥 Inawasha mtambo wa kufungasha na kukuhahamisha papo hapo!
});
