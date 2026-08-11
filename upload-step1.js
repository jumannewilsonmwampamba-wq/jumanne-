// ==========================================================================
// JUMANNETOK TZ - CORE UPLOAD ENGINE (STEP 1: BARE-METAL BLOB PERSISTENCE)
// ==========================================================================

(function () {
    "use strict";

    let dbIndexedAkiba = null;

    // 1. INJINI YA KI-HARDWARE: FUNGUA DATABASE YA NDANI YA SIMU (INDEXEDDB)
    function amshaDukaLaUploadLocal() {
        // Tunafungua database ile ile kuu ya mradi wetu kitaifa
        const ombiDuka = indexedDB.open("JumanneTok_Local_Cache", 1);

        ombiDuka.onupgradeneeded = function (e) {
            const db = e.target.result;
            // Suka chumba cha akiba ya feed na upload drafts kama hakipo
            if (!db.objectStoreNames.contains("jumannetok_feed_cache")) {
                db.createObjectStore("jumannetok_feed_cache", { keyPath: "id" });
            }
        };

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 1: Database ya IndexedDB imefunguka salama!");
        };

        ombiDuka.onerror = function () {
            console.error("❌ Mkwamo! Kivinjari kimegoma kufungua IndexedDB Step 1.");
            alert("Hitilafu ya Simu: Imeshindwa kuwasha duka la ndani la kuhifadhi video!");
        };
    }

    // 2. MTAMBO MKUU WA KUKAMATA VIDEO KUTOKA KWENYE KIFUNGO (INPUT FILE LISTENER)
    const videoInput = document.getElementById("jumanne-video-picker-input");

    if (videoInput) {
        videoInput.addEventListener("change", (e) => {
            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            // Uhakiki wa kijeshi: Lazimisha liwe faili la video halisi pekee!
            if (!faili.type.startsWith("video/")) {
                alert("Makosa: Tafadhali chagua faili la video halisi pekee (kama MP4)!");
                e.target.value = "";
                return;
            }

            // Kikomo cha uzani wa faili: Mwisho MB 40 kuokoa chaji na RAM ya seva
            const kikomoChaMb40 = 40 * 1024 * 1024;
            if (faili.size > kikomoChaMb40) {
                alert("Video yako ni nzito mno! Mfumo unaruhusu mwisho wa video ya MB 40 pekee.");
                e.target.value = "";
                return;
            }

            console.log(`⏳ Video imeteuliwa: ${faili.name} (${Math.round(faili.size / 1024 / 1024)} MB). Inasaga...`);

            // Washa mtambo wa kulaza Blob ghafi ndani ya diski ya simu
            hifadhiVideoKamaBlobDiskiKuu(faili);
        });
    }

    // 3. INJINI INAYOGANDISHA BLOB NDANI YA INDEXEDDB KUELEKEA HATUA YA PILI
    function hifadhiVideoKamaBlobDiskiKuu(blobVideoGhafi) {
        if (!dbIndexedAkiba) {
            alert("Mtambo wa kuhifadhi bado haujawa tayari, tafadhali chagua tena video baada ya sekunde moja!");
            return;
        }

        // Fungua muamala wa uandishi (readwrite) kwenye chumba chetu cha chuma
        const muamala = dbIndexedAkiba.transaction(["jumannetok_feed_cache"], "readwrite");
        const duka = muamala.objectStore("jumannetok_feed_cache");

        // 🔥 MKAKATI MKUU WA UTANGAMANO: Suka ufunguo thabiti unaosomeka sawa na index.html na step 3
        const dataYaVideoDraft = {
            id: "jumanne_current_upload_draft",
            jinaLaVideo: blobVideoGhafi.name || "singeli_kipaji.mp4",
            ukubwaWaVideo: blobVideoGhafi.size,
            videoBlobData: blobVideoGhafi, // Laza faili mnyofu kama Blob ya kinyoya bila kuunguza bando [A]
            tareheSajili: Date.now()
        };

        const ombiHifadhi = duka.put(dataYaVideoDraft);

        ombiHifadhi.onsuccess = function () {
            console.log("💾 Storage Secure: Video ya asili imelazwa kama Blob IndexedDB salama!");
            
            // Mfyatue msanii kioone sekunde iyo hiyo kuelekea Hatua ya 2 (Aina ya Kipaji) [A]
            window.location.href = "upload-step2.html";
        };

        ombiHifadhi.onerror = function (err) {
            console.error("❌ Mkwamo wa kuandika video ndani ya IndexedDB:", err);
            alert("Hitilafu: Simu imeshindwa kuhifadhi video hii kwenye diski ya ndani!");
        };
    }

    // Amsha duka la IndexedDB kioone kikiwaka macho sekunde ya sifuri
    amshaDukaLaUploadLocal();
})();
            
