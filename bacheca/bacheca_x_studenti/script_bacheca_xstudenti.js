let userIscrizioni = [];

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function loadBacheca() {
  fetch("../get_user_iscrizioni.php")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        userIscrizioni = data.iscrizioni;
      }
      return fetch("../../aggiunta_pcto/database/get_pcto.php");
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
        const subscribeButtonStyle = isIscritto
          ? "height: 35px; width: 80px; background-color: #afffafff; color: #000; border: 1px solid #4CAF50; padding:auto; border-radius: 7px; cursor: pointer; font-size: 16px;"
          : "height: 35px; width: 155px; background-color: transparent; color: #000; border: 1px solid #ccc; padding:auto; border-radius: 7px; cursor: pointer; font-size: 16px;";
        const buttonText = isIscritto ? "Iscritto" : "Iscriviti";

        const div = document.createElement("div");
        div.className = "pcto-item";
        div.innerHTML = `
          <span class="pcto-title">${pcto.title}</span>
          <span class="pcto-desc">${pcto.description}</span>
          <span class="pcto-start">${formatDate(pcto.start_date)}</span>
          <span class="pcto-end">${formatDate(pcto.end_date)}</span>
          <div class="button-container">
            <button onclick="handleSubscribe(this, ${
              pcto.id
            })" style="${subscribeButtonStyle}" class="iscriviti" data-pcto-id="${
          pcto.id
        }" data-iscritto="${isIscritto}">${buttonText}</button>
            <button onclick="handleUnsubscribe(this, ${
              pcto.id
            })" class="unsubscribe-btn ${
          isIscritto ? "show" : ""
        }" data-pcto-id="${pcto.id}" title="Disiscriviti">×</button>
          </div>
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

document.addEventListener("DOMContentLoaded", function () {
  loadBacheca();

  const imgProfilo = document.getElementById("img-profilo");
  if (imgProfilo) {
    let imageLoaded = false;

    imgProfilo.addEventListener("load", function () {
      if (!imageLoaded) {
        this.style.opacity = "1";
        imageLoaded = true;
      }
    });

    imgProfilo.addEventListener("error", function () {
      console.warn("Errore caricamento immagine profilo, usando fallback");
      if (!imageLoaded) {
        this.style.opacity = "1";
        imageLoaded = true;
      }
    });

    imgProfilo.style.opacity = "0.8";
    imgProfilo.style.transition = "opacity 0.3s ease";

    setTimeout(() => {
      if (!imageLoaded) {
        imgProfilo.style.opacity = "1";
        imageLoaded = true;
      }
    }, 1500);
  }
});

function handleSubscribe(btn, pctoId) {
  const isCurrentlySubscribed = btn.getAttribute("data-iscritto") === "true";

  if (isCurrentlySubscribed) {
    return;
  }

  btn.disabled = true;
  const unsubscribeBtn = btn.parentElement.querySelector(".unsubscribe-btn");

  const originalText = btn.textContent;
  let count = 0;
  const interval = setInterval(() => {
    count = (count + 1) % 4;
    btn.textContent = "●".repeat(count);
  }, 250);

  fetch("../manage_iscrizioni.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pcto_id: pctoId,
      action: "iscriviti",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      clearInterval(interval);

      if (data.success) {
        btn.classList.add("animate-shrink");
        btn.style.backgroundColor = "#afffafff";
        btn.style.borderColor = "#4CAF50";
        btn.textContent = "Iscritto";
        btn.setAttribute("data-iscritto", "true");
        setTimeout(() => {
          btn.style.width = "80px";
          unsubscribeBtn.classList.add("show", "animate-in");
        }, 150);
        if (!userIscrizioni.includes(pctoId)) {
          userIscrizioni.push(pctoId);
        }
      } else {
        btn.textContent = originalText;
        alert("Errore: " + (data.error || "Operazione fallita"));
      }
    })
    .catch((error) => {
      clearInterval(interval);
      btn.textContent = originalText;
      console.error("Errore:", error);
      alert("Errore di connessione");
    })
    .finally(() => {
      btn.disabled = false;
    });
}

function handleUnsubscribe(btn, pctoId) {
  btn.disabled = true;
  const subscribeBtn = btn.parentElement.querySelector(".iscriviti");

  fetch("../manage_iscrizioni.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pcto_id: pctoId,
      action: "disiscrivi",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        btn.classList.remove("show", "animate-in");
        setTimeout(() => {
          subscribeBtn.classList.remove("animate-shrink");
          subscribeBtn.classList.add("animate-expand");
          subscribeBtn.style.backgroundColor = "transparent";
          subscribeBtn.style.borderColor = "#ccc";
          subscribeBtn.textContent = "Iscriviti";
          subscribeBtn.setAttribute("data-iscritto", "false");
          setTimeout(() => {
            subscribeBtn.style.width = "155px";
            subscribeBtn.classList.remove("animate-expand");
          }, 300);
        }, 150);
        const index = userIscrizioni.indexOf(pctoId);
        if (index > -1) {
          userIscrizioni.splice(index, 1);
        }
      } else {
        alert("Errore: " + (data.error || "Operazione fallita"));
      }
    })
    .catch((error) => {
      console.error("Errore:", error);
      alert("Errore di connessione");
    })
    .finally(() => {
      btn.disabled = false;
    });
}
