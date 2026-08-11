// Global variable ya kubeba video binary data hewani
let failiLaVideoGhafi = null;

function amshaMtamboWaKupokeaVideo() {
    const videoInput = document.getElementById("jumanne-video-file-input");
    const dropzoneBox = document.getElementById("jumanne-upload-form-step1");
    const btnNext = document.getElementById("jumanne-to-step2");

    if (!videoInput || !btnNext) return;

    // MTEMBO WA KUSIKILIZA MTUMIAJI AKICHAGUA VIDEO
    videoInput.addEventListener("change", (e) => {
        const faili = e.target.value ? videoInput.files[0] : null;
        if (!faili) return;

        // 1. LANGO LA UKUBWA WA CHUMA: Kagua kama faili linazidi MB 45 tulizokubaliana
        const kikomoChaMb45 = 45 * 1024 * 1024; // Bytes zilizopo ndani ya MB 45
        
        if (faili.size > kikomoChaMb45) {
            console.warn("🛑 Usalama wa Seva: Faili ni zito mno!");
            alert(`Mkwamo wa Bando! Video yako ina ukubwa wa ${(faili.size / (1024 * 1024)).toFixed(1)} MB. Mfumo unaruhusu mwisho MB 45 tu kulinda bando lako!`);
            videoInput.value = ""; // Futa faili lile upesi
            return;
        }

        failiLaVideoGhafi = faili;
        console.log("📹 Video imepita chujio la ukubwa wa MB 45:", faili.name);

        // 2. 🔥 AKILI YA DYNAMIC THUMBNAIL: Chomoa picha ya juu kiotomatiki kwa kutumia Canvas
        try {
            const URLyaVideo = URL.createObjectURL(faili);
            const videoElement = document.createElement("video");
            videoElement.src = URLyaVideo;
            videoElement.muted = true;
            videoElement.playsInline = true;

            // Amuru kicheza video cha siri kianze kusoma sekunde ya kwanza
            videoElement.addEventListener("loadeddata", () => {
                videoElement.currentTime = 1; // Nenda sekunde ya 1 kupata picha safi ya sura
            });

            videoElement.addEventListener("seeked", () => {
                // Chora picha hewani kwa kutumia Canvas bila kutesa processor
                const canvas = document.createElement("canvas");
                canvas.width = 150;
                canvas.height = 150;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                // Geuza picha ile kuwa mnyororo fupi wa Base64 (Thumbnail ya lazima)
                const base64Thumbnail = canvas.toDataURL("image/jpeg", 0.5); // Quality 50% kulinda RAM
                
                // Ifungie hewani kwenye sessionStorage ili iende Hatua ya 3
                sessionStorage.setItem("jumannetok_preview_thumbnail", base64Thumbnail);
                console.log("📸 Live Thumbnail Preview imechomolewa na kufungiwa RAM Cache!");

                // Badilisha muonekano wa ile ikoni ya wingu kioni ionyeshe alama ya kijani ya ushindi
                const cloudIcon = document.querySelector(".jumanne-cloud-icon");
                if (cloudIcon) {
                    cloudIcon.className = "fas fa-check-circle";
                    cloudIcon.style.color = "#00e676";
                }
                const dText = document.querySelector(".jumanne-dropzone-text");
                if (dText) dText.innerText = "✅ Video imesomwa na ipo salama!";

                // Safisha kumbukumbu ya URL ya simu kulinda hewa
                URL.revokeObjectURL(URLyaVideo);
            });

        } catch (err) {
            console.error("Mkwamo wa kuchomoa picha ya mwanzo:", err);
        }
    });
}
// HATUA YA 1 (KIPANDE CHA 2): MTEGO WA ROBOT, DURATION LOCK & REDIRECT
function washaKitufeChaKuvukaHatuaYaPwanza() {
    const btnNext = document.getElementById("jumanne-to-step2");
    const videoInput = document.getElementById("jumanne-video-file-input");

    if (!btnNext || !videoInput) return;

    btnNext.addEventListener("click", () => {
        // [A] MTEGO WA USALAMA: Kagua kama Honeypot imeguswa na maroboti
        const honeyValue = document.getElementById("jumanne-video-bot-input").value;
        if (honeyValue.length > 0) {
            console.error("🛑 Usalama: Robot amenaswa kwenye upload hatua ya kwanza!");
            sessionStorage.clear(); // Safisha RAM yote
            window.location.reload();
            return;
        }

        // [B] VALIDATION: Kagua kama amechagua video
        if (!videoInput.files || videoInput.files.length === 0) {
            alert("Tafadhali chagua video yako ya kipaji kwanza kabla ya kusonga mbele!");
            return;
        }

        const failiKazi = videoInput.files[0];

        // [C] LANGO LA MUDA: Kagua urefu wa video kwa siri (Max Dakika 1 na Sekunde 30 = Sekunde 90)
        const videoSiriElement = document.createElement("video");
        videoSiriElement.src = URL.createObjectURL(failiKazi);
        
        videoSiriElement.addEventListener("loadedmetadata", () => {
            const urefuWaVideo = videoSiriElement.duration;
            URL.revokeObjectURL(videoSiriElement.src); // Safisha RAM fasta

            // Dakika 1 na sekunde 30 ni sawa na sekunde 90 kamili za ulinzi
            if (urefuWaVideo > 90.5) { 
                console.warn("🛑 Usalama wa Seva: Video ina urefu wa zaidi ya dakika 1 na sekunde 30!");
                alert(`Usajili wa Video Umesitishwa! Mfumo wetu unaruhusu video za dakika 1 na sekunde 30 tu kwa ajili ya Challenge Week. Hivi sasa video yako ina sekunde ${urefuWaVideo.toFixed(0)}.`);
                return;
            }

            // [D] COMPRESSION PREVIEW & BASE64 STORAGE (Wazo letu la kijasusi la Canvas)
            // Mkuu, hapa tunageuza video kuwa Base64 string nyepesi kwa kutumia FileReader
            // ili data iweze kubebwa na kusafiri salama kwenye sessionStorage kwenda fomu ya 3
            const msomajiWafaili = new FileReader();
            msomajiWafaili.readAsDataURL(failiKazi);

            msomajiWafaili.onload = function(e) {
                const videoBase64String = e.target.result;

                // Funga mzigo wote wa Hatua ya 1 ndani ya droo ya RAM Cache
                const dataYaHatuaYaKwanza = {
                    jinaLaVideo: failiKazi.name,
                    ukubwaWaVideo: failiKazi.size,
                    videoGhafiBase64: videoBase64String
                };

                sessionStorage.setItem("jumannetok_upload_step1", JSON.stringify(dataYaHatuaYaKwanza));
                console.log("✅ Hatua ya 1 Imefungwa kwa herufi za kijani RAM Cache!");

                // [E] KUVUKA GOLI: Mrushe mtumiaji hatua ya pili kwa sekunde sifuri!
                window.location.href = "upload-step2.html";
            };

            msomajiWafaili.onerror = function() {
                alert("Mkwamo wa chuma! Imeshindwa kusoma video kwenye RAM ya simu.");
            };
        });
    });
}

// INAAMSHA INJINI YOTE MARA TU KIOO KINAPOFUNGUKA LEO 2026
window.addEventListener("DOMContentLoaded", () => {
    amshaMtamboWaKupokeaVideo();
    washaKitufeChaKuvukaHatuaYaPwanza();
});
