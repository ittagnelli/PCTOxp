function loadBacheca() {
  Promise.all([
    fetch("../../aggiunta pcto/database/get_pcto.php").then((res) =>
      res.json()
    ),
    fetch("../get_studenti_iscritti.php").then((res) => res.json()),
  ])
    .then(([pctoData, iscrizioniData]) => {
      const box = document.getElementById("pcto-info-box");
      box.innerHTML = "";

      if (pctoData.length === 0) {
        box.innerHTML = "<p>Nessun PCTO disponibile al momento.</p>";
        return;
      }

      const iscrizioniMap = {};
      if (iscrizioniData.success) {
        iscrizioniData.data.forEach((item) => {
          iscrizioniMap[item.pcto_id] = {
            num_iscritti: item.num_iscritti,
            studenti_iscritti: item.studenti_iscritti,
          };
        });
      }

      pctoData.forEach((pcto) => {
        const iscrizioniInfo = iscrizioniMap[pcto.id] || {
          num_iscritti: 0,
          studenti_iscritti: [],
        };

        const div = document.createElement("div");
        div.className = "pcto-item";

        let studentiHtml = "";
        if (iscrizioniInfo.num_iscritti > 0) {
          studentiHtml = `
            <div class="studenti-iscritti" style="margin-top: 10px; padding: 8px; background-color: #ffffffff; border-radius: 5px; grid-area: studenti;">
              <strong>Studenti iscritti (${
                iscrizioniInfo.num_iscritti
              }):</strong>
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${iscrizioniInfo.studenti_iscritti
                  .map((studente) => `<li>${studente}</li>`)
                  .join("")}
              </ul>
            </div>
          `;
        } else {
          studentiHtml = `
            <div class="studenti-iscritti" style="margin-top: 10px; padding: 8px; background-color: #ffffffff; border-radius: 5px; color: #666; grid-area: studenti;">
              <em>Nessuno studente iscritto</em>
            </div>
          `;
        }

        div.innerHTML = `
          <span class="pcto-title">${pcto.title}</span>
          <span class="pcto-desc">${pcto.description}</span>
          <span class="pcto-start">${pcto.end_date}</span>
          <span class="pcto-end">${pcto.start_date}</span>
          ${studentiHtml}
        `;
        box.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Errore nel caricamento della bacheca:", error);
      document.getElementById("pcto-info-box").innerHTML =
        "<p>Errore nel caricamento dei dati.</p>";
      console.error("Error details:", error);
    });
}


document.addEventListener("DOMContentLoaded", function() {
  loadBacheca();
  
  const imgProfilo = document.getElementById('img-profilo');
  if (imgProfilo) {
    let imageLoaded = false;
    
    imgProfilo.addEventListener('load', function() {
      if (!imageLoaded) {
        this.style.opacity = '1';
        imageLoaded = true;
      }
    });
    
    imgProfilo.addEventListener('error', function() {
      console.warn('Errore caricamento immagine profilo, usando fallback');
      if (!imageLoaded) {
        this.style.opacity = '1';
        imageLoaded = true;
      }
    });
    
    imgProfilo.style.opacity = '0.8';
    imgProfilo.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
      if (!imageLoaded) {
        imgProfilo.style.opacity = '1';
        imageLoaded = true;
      }
    }, 1500);
  }
});
