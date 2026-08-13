    // ==========================================================================
    // HATUA YA 3: INTERACTIVE ROUTER & REAL-TIME DATA INGESTION ENGINE (BACKGROUND SYNC)
    // ==========================================================================
    function amshaUsimamiziWaKitufeChaMwisho() {
        if (!btnPublish) return;

        btnPublish.addEventListener("click", function (event) {
            event.preventDefault();

            // 1. Mtego wa Siri wa Ma-Robot (Honeypot Enforcement)
            const botInput = document.getElementById("jumanne-video-bot-input-step3");
            if (botInput && botInput.value.length > 0) {
                sessionStorage.clear();
                window.location.reload();
                return;
            }

            // 2. Uhakiki wa haraka wa maelezo (Caption Check)
            let maandishiCaption = captionBox ? captionBox.innerText.trim() : "";
            let maandishiTags = tagsBox ? tagsBox.innerText.trim() : "";

            if (maandishiCaption.length === 0) {
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "⚠️ Tafadhali andika maelezo ya video (Caption) kwanza mkuu!");
                if (captionBox) captionBox.focus();
                return;
            }

            // 3. Badilisha muonekano wa kitufe kuzuia double click mlangoni
            btnPublish.disabled = true;
            btnPublish.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inasajili Seva...';

            // 4. PIPELINE HARVESTER: Vuta data zilizosajiliwa kule Step 2
            let dataStep2Str = sessionStorage.getItem("jumannetok_step2_data");
            let dataStep2 = dataStep2Str ? JSON.parse(dataStep2Str) : {};
            let jinaLaVideoAsili = sessionStorage.getItem("jumannetok_video_name") || "mdundo_ghafi.mp4";

            // Suka kifurushi kikamilifu cha maandishi mepesi kuelekea Node.js Master Server
            const wasifuWaVideoUpload = {
                videoId: Math.floor(100000 + Math.random() * 900000), // Fyatua ID nasibu ya video
                jinaVideo: jinaLaVideoAsili,
                caption: maandishiCaption,
                hashtags: maandishiTags || "#jumannetok #uzalendo",
                kipajiKundi: dataStep2.ainaYaKipaji || "Singeli",
                utaratibu: dataStep2.utaratibuWaVideo || "challenge",
                tareheUchapishaji: Date.now()
            };

            // 5. MTAMBO WA FETCH: Sukuma data za maandishi mnyofu kwenda ProfileDB & SearchDB
            // (Hapa tunatupa direct kwenye seva yetu ya Monolith Port 3000)
            const urlYaSevaMaster = "http://localhost:3000/api";

            // Tunajaza kete ya kwanza ya maandishi hewani kwa sekunde ya sifuri
            fetch(`${urlYaSevaMaster}/profiles/sync-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(wasifuWaVideoUpload)
            })
            .then(res => {
                // Hata kama seva yetu ya Node ipo offline maabara, tunakimbiza Offline Survival Mode!
                return res.ok ? res.json() : wasifuWaVideoUpload;
            })
            .then(dataNode => {
                console.log("🚀 Seva Kuu imepokea metadata ya video:", dataNode);

                // 6. KUFUNGA DATA YA MB CATCH: Tunatunza taarifa hizi sessionStorage ili i.js izidake
                sessionStorage.setItem("jumannetok_upload_meta", JSON.stringify(wasifuWaVideoUpload));

                // 🔥 PIGO LA USHINDI: Funga kabisa database ya Step 3 hapa kuzuia memory leak!
                if (dbIndexedAkiba) {
                    dbIndexedAkiba.close();
                    console.log("🛡️ Database ya ndani imefungwa salama mlangoni pa Step 3.");
                }

                // 7. TOAST OF VICTORY: Lupusha ule ujumbe wa chuma unaotoweka ndani ya sekunde 5!
                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "🎉 Data Inserted Successfully! Unapelekwa Feed...");
                
                // Vika ukingo wa rangi ya kijani ya ushindi wa kizalendo 🇹🇿
                const toastKioo = document.getElementById("jumanne-caption-error-toast");
                if (toastKioo) toastKioo.style.color = "#00e676";

                // Mpe sekunde 1.5 kamili aone ujumbe, kisha mtoe mnyofu akatafute bando vizuri index.html
                setTimeout(() => {
                    window.location.href = "./index.html"; // Relative Path salama kwa ajili ya GitHub Pages
                }, 1500);
            })
            .catch(err => {
                console.warn("⚠️ Offline Mode Activated: Seva ipo bize, tunasave local na kuhama.");
                
                // Mrejee kwa dharura hata mtandao ukikata asikwame mlangoni
                sessionStorage.setItem("jumannetok_upload_meta", JSON.stringify(wasifuWaVideoUpload));
                if (dbIndexedAkiba) dbIndexedAkiba.close();

                onyeshaUjumbeWaMuda("jumanne-caption-error-toast", "⏳ Seva ipo bize! Mdundo umehifadhiwa, unapelekwa Feed...");
                
                setTimeout(() => {
                    window.location.href = "./index.html";
                }, 1500);
            });
        });
    }

    // 🔥 TIMING PROTOCOL DRIVER: Subiri HTML imalizike kusomwa ndipo uwashe injini zote
    document.addEventListener("DOMContentLoaded", function () {
        // 1. Washa database ya ndani upesi ili kuvuta vipande vya video
        const ombiDuka = indexedDB.open("JumanneTok_Chunk_Storage", 1);

        ombiDuka.onsuccess = function (e) {
            dbIndexedAkiba = e.target.result;
            console.log("✅ Step 3: Database ya vipande imefunguka vizuri!");
            vutaVipandeKutokaKwenyeDiski();
        };

        ombiDuka.onerror = function () {
            console.error("❌ Step 3: Database imegoma kufunguka.");
            vutaVipandeKutokaKwenyeDiski();
        };

        // 2. Washa mitambo yote ya maandishi na vifungo vya kioo
        amshaUsimamiziWaCaption();
        amshaUsimamiziWaKitufeChaMwisho();
    });

})(); // Inafunga lile viwambo kikuu cha faili zima mnyofu kitalent!

    
