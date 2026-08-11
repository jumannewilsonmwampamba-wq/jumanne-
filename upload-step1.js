(function () {
    "use strict";

    // 1. Daka kitufe chako cha HTML kwa kutumia ID yake halisi
    const btnNext = document.getElementById("jumanne-btn-force-next-step2");

    // 2. Kagua kama kivinjari kimeipata hiyo ID au la
    if (!btnNext) {
        alert("Mkuu, kivinjari kimeshindwa kupata kitufe chenye ID ya: jumanne-btn-force-next-step2");
    } else {
        // 3. Weka agizo la majaribio pindi kitufe kikibonyezwa
        btnNext.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            
            alert("Safi sana mkuu! Kitufe kimesomwa na sasa kinafanya kazi!");
            // window.location.href = "upload-step2.html";
        });
    }
})();
