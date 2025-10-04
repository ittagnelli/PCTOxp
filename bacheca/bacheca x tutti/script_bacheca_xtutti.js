// Funzione per formattare le date da YYYY-MM-DD a gg-mm-aaaa
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function loadBacheca() {
  fetch("../../aggiunta pcto/database/get_pcto.php")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const box = document.getElementById("pcto-info-box");
      box.innerHTML = "";

      if (data.length === 0) {
        box.innerHTML = "<p>Nessun PCTO disponibile al momento.</p>";
        return;
      }

      data.forEach((pcto) => {
        const div = document.createElement("div");
        div.className = "pcto-item";
        div.innerHTML = `
          <span class="pcto-title">${pcto.title}</span>
          <span class="pcto-desc">${pcto.description}</span>
          <span class="pcto-start">${formatDate(pcto.start_date)}</span>
          <span class="pcto-end">${formatDate(pcto.end_date)}</span>
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

document.addEventListener("DOMContentLoaded", loadBacheca);
