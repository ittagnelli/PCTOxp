let userIscrizioni = [];

function loadBacheca() {
  fetch("../get_user_iscrizioni.php")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        userIscrizioni = data.iscrizioni;
      }
      return fetch("../../aggiunta pcto/database/get_pcto.php");
    })
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
        const isIscritto = userIscrizioni.includes(parseInt(pcto.id));
        const buttonStyle = isIscritto ? 
          "height: 35px; width: 100px; background-color: #afffafff; color: #000; border: 1px solid #4CAF50; padding:auto; border-radius: 7px; cursor: pointer; font-size: 16px;" :
          "height: 35px; width: 100px; background-color: transparent; color: #000; border: 1px solid #ccc; padding:auto; border-radius: 7px; cursor: pointer; font-size: 16px;";
        const buttonText = isIscritto ? "Iscritto" : "Iscriviti";
        
        const div = document.createElement("div");
        div.className = "pcto-item";
        div.innerHTML = `
          <span class="pcto-title">${pcto.title}</span>
          <span class="pcto-desc">${pcto.description}</span>
          <span class="pcto-start">${pcto.end_date}</span>
          <span class="pcto-end">${pcto.start_date}</span>
          <button onclick="Iscrizione(this, ${pcto.id}, ${isIscritto})" style="${buttonStyle}" class="iscriviti" data-pcto-id="${pcto.id}" data-iscritto="${isIscritto}">${buttonText}</button>
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

function Iscrizione(btn, pctoId, isCurrentlyIscritto) {
  btn.disabled = true;
  
  const originalText = btn.textContent;
  let count = 0;
  const interval = setInterval(() => {
    count = (count + 1) % 4;
    btn.textContent = "●".repeat(count);
  }, 250);

  const action = isCurrentlyIscritto ? 'disiscrivi' : 'iscriviti';
  
  fetch("../manage_iscrizioni.php", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pcto_id: pctoId,
      action: action
    })
  })
  .then(res => res.json())
  .then(data => {
    clearInterval(interval);
    
    if (data.success) {
      if (action === 'iscriviti') {
        btn.style.backgroundColor = "#afffafff";
        btn.style.borderColor = "#4CAF50";
        btn.textContent = "Iscritto";
        btn.setAttribute('data-iscritto', 'true');
        btn.onclick = () => Iscrizione(btn, pctoId, true);
        if (!userIscrizioni.includes(pctoId)) {
          userIscrizioni.push(pctoId);
        }
      } else {
        btn.style.backgroundColor = "transparent";
        btn.style.borderColor = "#ccc";
        btn.textContent = "Iscriviti";
        btn.setAttribute('data-iscritto', 'false');
        btn.onclick = () => Iscrizione(btn, pctoId, false);
        const index = userIscrizioni.indexOf(pctoId);
        if (index > -1) {
          userIscrizioni.splice(index, 1);
        }
      }
    } else {
      btn.textContent = originalText;
      alert('Errore: ' + (data.error || 'Operazione fallita'));
    }
  })
  .catch(error => {
    clearInterval(interval);
    btn.textContent = originalText;
    console.error('Errore:', error);
    alert('Errore di connessione');
  })
  .finally(() => {
    btn.disabled = false;
  });
}
