// upload-step1.js - Hatua ya Kwanza: Kuandaa Kumbukumbu na Kitufe

(function () {
    "use strict";

    let dbIndexedAkiba = null;

    // 1. ANZA KUTENGENEZA MEMORI MAALUM KWENYE DISKI YA SIMU (INDEXEDDB)
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

    // Washa memori mara moja
    amshaDukaLaUploadLocal();

    // 2. DAKA KITUFE CHAKO HALISI KUTOKA KWENYE HTML
    const btnNext = document.getElementById("jumanne-btn-force-next-step2");

    if (!btnNext) {
        alert("Hitilafu: Kivinjari hakioni kitufe chenye ID ya: jumanne-btn-force-next-step2");
    } else {
        // Jaribio la kubonyeza kitufe kabla hatujaweka mambo ya video
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            
            alert("Mkuu, kitufe kiko hai! Sasa kimeitikia amri vizuri.");
        });
    }

})();
