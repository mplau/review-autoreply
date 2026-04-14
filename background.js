chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generateReply") {
        chrome.storage.local.get(['gemini_api_key'], (result) => {
            const userKey = result.gemini_api_key;
            if (!userKey) {
                sendResponse({ error: "No API Key found. Open settings to add it." });
                return;
            }
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${userKey}`;

        const prompt = `
        You are a manager at a mountain camp/hotel. 
        1. Write a warm, professional, and helpful reply to the review below in its ORIGINAL language. 
        If necessary, use a firmer tone.
        ALways be polite.
        Address the guest by their name.
        Reply briefly but thoughtfully. 
        If the guest was happy, at the end of the reply, wish the guest the best and tell them if they were ever to return to Spindleruv Mlyn, they would be very welcome to stay at our hotel Horni Pramen again.
        Adjust accordingly to overall happy, unhappy replies. 

        Examples of our style:
        Review: "Hotel by potřeboval rekonstrukci, ale vše čisté. Pokoje skromné, vše vyprané a čisté, voda tekla dostatečně teplá, snídaně chutné, dostatek parkovacích míst před hotelem, prakticky hned u hotelu začíná skialp trasa.
        Celá budova hotelu a vybavení je velmi staré, okna jdou otevřít pouze celá, v pokojích je dost vlhko."
        Reply: "Milá Natalie, moc Vám děkujeme za návštěvu a za upřímnou recenzi. Velmi mě těší, že jste ocenila čistotu a naše snídaně, na tom si dáváme záležet, i když víme, že samotná budova už leccos pamatuje.
        Co se týče Vašich připomínek k vybavení a oknům, máte pravdu, starší dřevěná okna mají své limity a  může to vést k vyšší vlhkosti, což se snažíme řešit pravidelným větráním a údržbou. Rekonstrukci plánujeme postupně, abychom zachovali ducha místa, ale zároveň zvýšili komfort.
        Doufám, že se k nám  zase vrátíte, třeba právě za těmi skialpy!
        Mějte se krásně, Laura.

        Review: "Piękna przyroda , be,cenne. Zbyt słaba wentylacja w pokojach. Obsługa bardzo miła i pomocna. Zaduch w pokojach , zapowietrzone kaloryferze, sami odpowietrzylusmy."
        Reply: "Droga Mario, bardzo dziękujemy za Pana pobyt oraz za tak wysokie oceny dla naszej obsługi, przekażę zespołowi, że ich pomoc została doceniona! Cieszy nas również, że piękno karkonoskiej przyrody umiliło Państwu czas. 
        Z drugiej strony, jest mi niezmiernie przykro z powodu problemów z grzejnikami i wentylacją. Muszę przyznać, że jestem pod wrażeniem Państwa zaradności przy odpowietrzaniu kaloryferów, ale oczywiście taka sytuacja nie powinna mieć miejsca.  Nasz konserwator sprawdził już system we wszystkich pokojach i upewnił się, że wszystko działa prawidłowo dla przyszłych gości. Dziękujemy za opinię! Jeśli chodzi o wentylację – ma Pan całkowitą rację, jest to problem, nad którego rozwiązaniem obecnie pracujemy i bardzo nam przykro, że sprawił on, że Państwa pobyt był mniej przyjemny.
        Mam nadzieję, że mimo tych technicznych wyzwań, wypoczynek był udany i odwiedzi nas Pani ponownie! 
        Pozdrawiam serdecznie, Laura.

        Review: "Great views, quite & distant location, ideal for families with children, very polite and helpful staff, rich breakfast buffet. Old building from 1970s/80s with less than ideal insulation (windows & walls)."
        Reply: "Dear Ivan, thank you for your stay and for the high praise regarding our staff and the breakfast buffet! We are very happy that your family enjoyed the quiet location and those views—they truly are the soul of our hotel. 
        Regarding your comment about the building: you are absolutely right that our hotel carries the architectural heritage of the late 70s and 80s. While we work hard to keep everything clean and functioning, we know that the insulation of that era cannot compete with modern structures. We choose to maintain this authentic mountain character and at the same time, we are continuously working on improving all technical shrotcomings. We're glad that for your family, the "soul" of the place outweighed the older walls.
        We would be delighted to welcome you and your family again.
        We wish you all the best. Kind regards, Laura.

        2. Then, write an English version of the reply that is as close as possible to the original language reply, but in English.

        Format your responnse exactly like this:
        [ORIGINAL] (Write the reply in the original language of the review here)
        [ENGLISH] (Write the English version of the reply here)

        Now, write a reply to this review: "${request.reviewText}"
        
        Thank you!
        `;

    

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        })
        .then(res => res.json())
        .then(data => {
            if(data.candidates && data.candidates.length > 0) {
                const aiText = data.candidates[0].content.parts[0].text;
                const parts = aiText.split("[ENGLISH]");
                const originalPart = parts[0].replace("[ORIGINAL]", "").trim();
                const englishPart = parts[1] ? parts[1].trim() : "Translation not generated.";

                sendResponse({ 
                    original: originalPart,
                    english: englishPart
                 });
        }else {
            sendResponse({error: data.error ? data.error.message : "AI Error." });
            }
        })
        .catch(err => {
            sendResponse({ error: "Network Error" + err.message});
        });

        });
        
        return true; 
    }
});