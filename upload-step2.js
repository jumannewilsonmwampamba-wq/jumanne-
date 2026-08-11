
let haliYaVideoIliyochaguliwa = "challenge";
let dbIndexedAkiba = null; 

// 1. FUNGUA DATABASE UKURASA UKIFUNGUKA
function amshaDukaLaStep2Local() {
    const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

    ombiDuka.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("jumannetok_feed_cache")) {
            db.createObjectStore("jumannetok_feed_cache", { keyPath: "id" });
        }
    };

    ombiDuka.onsuccess = function(e) {
        dbIndexedAkiba = e.target.result;
        console.log("✅ Step 2: Database imefunguka!");
        
        // Iambie JS ivute video upesi kioni
        vutaNaUchezeVideoYaStep1();
        
        // Rejesha data za form kama alirudi nyuma
        rejeshaDataZaHatuaYaPieli();
    };

    ombiDuka.onerror = function() {
        console.error("❌ IndexedDB imegoma kufunguka.");
    };
}

// 2. KIKORINGO CHA KUVUTA BLOB NA KUCHEZA VIDEO JUU
function vutaNaUchezeVideoYaStep1() {
    if (!dbIndexedAkiba) return;

    const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readonly");
    const duka = muamala.objectStore("jumannetok_feed_cache");
    const ombiDaka = duka.get("jumanne_current_upload_draft");

    ombiDaka.onsuccess = function(e) {
        const data = e.target.result;
        
        if (data && data.videoBlobData) {
            const playerStep2 = document.getElementById("jumanne-local-preview-player-step2");
            try {
                // Tengeneza URL safi ya Blob ya ndani ya simu
                const URLyaVideoStep2 = URL.createObjectURL(data.videoBlobData);
                if (playerStep2) {
                    playerStep2.src = URLyaVideoStep2;
                    playerStep2.play().catch(() => {});
                }
            } catch (err) {
                console.error(err);
            }
        }
    };
}
// 3. BADILISHA RANGI ZA KADI NA MA-ICON KIONONI
function chaguaHaliYaVideo(aina) {
    haliYaVideoIliyochaguliwa = aina;
    
    const cardChallenge = document.getElementById("jumanne-card-challenge");
    const cardFreestyle = document.getElementById("jumanne-card-freestyle");
    const radioChallenge = document.getElementById("jumanne-radio-challenge");
    const radioFreestyle = document.getElementById("jumanne-radio-freestyle");

    // Daka ma-icon ya Font Awesome
    const iconTrophy = document.querySelector(".fa-trophy");
    const iconMicrophone = document.querySelector(".fa-microphone");

    if (!cardChallenge || !cardFreestyle) return;

    if (aina === "challenge") {
        cardChallenge.style.border = "2px solid #00e676"; 
        cardFreestyle.style.border = "1px solid #222"; 
        if (radioChallenge) radioChallenge.checked = true;

        // Washa Trophy iwe ya Kijani, zima Mic iwe ya kijivu
        if (iconTrophy) iconTrophy.style.color = "#00e676"; 
        if (iconMicrophone) iconMicrophone.style.color = "#888"; 
    } 
    else if (aina === "freestyle") {
        cardFreestyle.style.border = "2px solid #00e676"; 
        cardChallenge.style.border = "1px solid #222"; 
        if (radioFreestyle) radioFreestyle.checked = true;

        // Washa Mic iwe ya Kijani, zima Trophy iwe ya kijivu
        if (iconMicrophone) iconMicrophone.style.color = "#00e676"; 
        if (iconTrophy) iconTrophy.style.color = "#888"; 
    }
}
// 4. MTAMBO WA KUBONYEZA NEXT NA KUHAMIA STEP 3 NYOOFU!
function amshaMtamboWaHatuaYaPili() {
    const btnNext = document.getElementById("jumanne-to-step3");
    const categorySelect = document.getElementById("jumanne-video-category");

    if (!btnNext || !categorySelect) return;

    btnNext.addEventListener("click", () => {
        // Kagua Honeypot ya marobot upole bila crash
        const botInput = document.getElementById("jumanne-video-bot-input-step2");
        const honeyValue2 = botInput ? botInput.value : "";
        if (honeyValue2.length > 0) {
            sessionStorage.clear(); 
            window.location.href = "upload-step1condition ? true : false.html";
            return;
        }

        // Kagua kama amechagua aina ya kipaji
        const kipajiKilichochaguliwa = categorySelect.value;
        if (!kipajiKilichochaguliwa) {
            alert("Tafadhali chagua aina ya kipaji chako kwenye orodha kwanza kabla ya kusonga mbele!");
            return;
        }

        // 🔥 FUNGA DATA SAFARI HII KWENYE STORAGE YA MUDA
        const dataYaHatuaYaPili = {
            ainaYaKipaji: kipajiKilichochaguliwa,
            utaratibuWaVideo: haliYaVideoIliyochaguliwa 
        };

        sessionStorage.setItem("jumannetok_upload_step2", JSON.stringify(dataYaHatuaYaPili));
        console.log("✅ Hatua ya 2 imejifunga, mfumo unakuhamisha...");

        // 🔥 USHINDI: Mtupe mtumiaji Hatua ya 3 upesi sana!window.location.href = "upload-step3.html"; // Hakikisha inaenda Step 3 na sio Step 1!
        window.location.href = "upload-step3.html";
    });
}

// 5. REJESHA DATA KAMA USER AMERUDI NYUMA (STATE PERSISTENCE)
function rejeshaDataZaHatuaYaPieli() {
    const dataYaZamaniGhafi = sessionStorage.getItem("jumannetok_upload_step2");
    const categorySelect = document.getElementById("jumanne-video-category");
    
    if (dataYaZamaniGhafi) {
        try {
            const data = JSON.parse(dataYaZamaniGhafi);
            if (categorySelect && data.ainaYaKipaji) {
                categorySelect.value = data.ainaYaKipaji;
            }
            if (data.utaratibuWaVideo) {
                chaguaHaliYaVideo(data.utaratibuWaVideo);
                return;
            }
        } catch (e) { console.error(e); }
    }
    chaguaHaliYaVideo("challenge"); // Default master view
}

// AMRE KUU YA KUWASHA INJINI YOTE MARA MOJA
window.addEventListener("DOMContentLoaded", () => {
    amshaDukaLaStep2Local();
    amshaMtamboWaHatuaYaPili();
});
