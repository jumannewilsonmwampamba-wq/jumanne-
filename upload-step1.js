// upload-step1.js - Hatua ya Pili: Kuunganisha Kitufe na Boksi la Faili

(function () {
    "use strict";

    let dbIndexedAkiba = null;
    let failiLaVideoAsili = null; // Hapa ndipo video itakapokaa ikishachaguliwa

    // 1. ANZA KUTENGENEZA MEMORI MAALUM KWENYE DISKI YA SIMU
    function amshaDukaLaUploadLocal() {
        const ombiDuka = indexedDB.open("JumanneTok_Storage_v2", 1);

        ombiDuka.onupgradeneeded = function (e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("video_drafts")) {
                db.createObjectStore("video_drafts", { keyPath: "id" });
            }
        };

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Kumbukumbu maalum ya diski imewaka salama!");
        };

        ombiDuka.onerror = function () {
            console.error("❌ Imeshindikana kufungua kumbukumbu ya ndani.");
        };
    }

    amshaDukaLaUploadLocal();

    // 2. DAKA ELEMENT ZA HTML KWA AJILI YA KUCHAGUA VIDEO
    const videoInput = document.getElementById("jumanne-video-file-input");
    const uploadDropzone = document.getElementById("jumanne-upload-box-dashed");
    const btnNext = document.getElementById("jumanne-btn-force-next-step2");

    // 3. MTAMBO WA KUTEGA FILAMU: Mtumiaji akichagua video
    if (videoInput) {
        videoInput.addEventListener("change", function (e) {
            e.stopPropagation();

            // Tunadaka faili la kwanza kabisa la video
            const faili = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
            if (!faili) return;

            // Hifadhi faili kwenye variable yetu ya juu
            failiLaVideoAsili = faili;
            
            // Leta ujumbe thabiti kuwa video imesomwa
            alert("Mkuu, video imechaguliwa kwa mafanikio! Jina la faili ni: " + faili.name);
        });
    }

    // 4. KITUFE CHA INAYOFUATA CONTROL
    if (btnNext) {
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            
            if (!failiLaVideoAsili) {
                alert("Mkuu, tafadhali gusa lile boksi la kijani kwanza ili uchague video ya kipaji chako!");
                return;
            }

            alert("Safi! Sasa tunaenda kuihifadhi video yenye jina: " + failiLaVideoAsili.name);
        })();
    }

})();
            
