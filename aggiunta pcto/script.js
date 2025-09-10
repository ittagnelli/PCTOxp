const calendarBody = document.getElementById("calendarBody");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

const today = new Date();
let currentDate = new Date(today.getFullYear(), today.getMonth());
let monthsLoaded = 0;
const maxMonths = 13;

let startSelected = null;
let endSelected = null;

function loadNextMonth() {
  if (monthsLoaded >= maxMonths) return;
  renderMonth(currentDate);
  currentDate.setMonth(currentDate.getMonth() + 1);
  monthsLoaded++;
}

function renderMonth(date) {
  const monthDiv = document.createElement("div");
  monthDiv.className = "month";

  const monthTitle = document.createElement("div");
  monthTitle.className = "month-title";
  monthTitle.textContent = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  monthDiv.appendChild(monthTitle);

  const grid = document.createElement("div");
  grid.className = "days-grid";

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  for (let i = 0; i < (firstDay + 6) % 7; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    empty.textContent = "";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBox = document.createElement("div");
    dayBox.className = "day";
    const fullDate = new Date(date.getFullYear(), date.getMonth(), day);
    dayBox.dataset.date = fullDate.toISOString();
    dayBox.textContent = day;

    dayBox.addEventListener("click", () => selectDate(dayBox));
    grid.appendChild(dayBox);
  }

  monthDiv.appendChild(grid);
  calendarBody.appendChild(monthDiv);
}

function selectDate(element) {
  if (element.classList.contains("empty")) return;
  const selectedDate = new Date(element.dataset.date);

  if (startSelected && endSelected) {
    const prevStart = document.querySelector(
      `.day[data-date="${startSelected.toISOString()}"]`
    );
    const prevEnd = document.querySelector(
      `.day[data-date="${endSelected.toISOString()}"]`
    );

    if (prevStart) {
      prevStart.classList.remove("selected", "first-in-range", "animate-start");
      prevStart.style.backgroundColor = "";
      prevStart.style.color = "";
    }

    if (prevEnd) {
      prevEnd.classList.remove("selected", "last-in-range", "animate-start");
      prevEnd.style.backgroundColor = "";
      prevEnd.style.color = "";
    }
  }

  if (!startSelected || (startSelected && endSelected)) {
    clearSelections();
    startSelected = selectedDate;
    element.classList.add("selected", "first-in-range", "animate-start");
    startDateInput.value = formatDate(startSelected);
    endDateInput.value = "";
    endSelected = null;
  } else if (selectedDate >= startSelected) {
    endSelected = selectedDate;
    highlightRange();
    endDateInput.value = formatDate(endSelected);
  } else {
    clearSelections();
    startSelected = selectedDate;
    element.classList.add("selected", "first-in-range", "animate-start");
    startDateInput.value = formatDate(startSelected);
    endDateInput.value = "";
    endSelected = null;
  }
}

function clearSelections() {
  document.querySelectorAll(".day").forEach((day) => {
    day.classList.remove(
      "selected",
      "in-range",
      "first-in-range",
      "last-in-range",
      "animate-start",
      "animate-range"
    );
  });
}

function restartAnimation(element, animationClass) {
  element.classList.remove(animationClass);
  void element.offsetWidth;
  element.classList.add(animationClass);
}

function highlightRange() {
  const days = Array.from(document.querySelectorAll(".day"))
    .filter((day) => day.dataset.date)
    .sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date));

  const startTime = startSelected.getTime();
  const endTime = endSelected.getTime();

  days.forEach((day) => {
    day.classList.remove(
      "selected",
      "in-range",
      "first-in-range",
      "last-in-range",
      "animate-start",
      "animate-range"
    );
    day.style.backgroundColor = "";
    day.style.color = "";
    day.style.animationDelay = "";
  });

  days.forEach((day, index) => {
    const dayTime = new Date(day.dataset.date).getTime();

    if (dayTime === startTime) {
      day.classList.add("selected", "first-in-range");
      day.style.backgroundColor = "black";
      day.style.color = "white";
      restartAnimation(day, "animate-start");
    } else if (dayTime === endTime) {
      day.classList.add("selected", "last-in-range");
      day.style.backgroundColor = "black";
      day.style.color = "white";
      const delay = index * 0.05;
      day.style.animationDelay = delay + "s";
      restartAnimation(day, "animate-start");
    } else if (dayTime > startTime && dayTime < endTime) {
      day.classList.add("in-range");
      const delay = index * 0.05;
      day.style.animationDelay = delay + "s";
      restartAnimation(day, "animate-range");
    }
  });
}

function formatDate(date) {
  return date.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

for (let i = 0; i < 13; i++) loadNextMonth();

calendarBody.addEventListener("scroll", () => {
  if (
    calendarBody.scrollTop + calendarBody.clientHeight >=
    calendarBody.scrollHeight - 50
  ) {
    loadNextMonth();
  }
});

function formatDateForDB(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadBacheca() {
  fetch("database/get_pcto.php")
    .then((res) => res.json())
    .then((data) => {
      const box = document.getElementById("pcto-info-box");
      box.innerHTML = "";
      data.forEach((pcto) => {
        const div = document.createElement("div");
        div.className = "pcto-info-entry";
        div.innerHTML = `
        <span class="pcto-title">${pcto.title}</span>
        <span class="pcto-desc">${pcto.description}</span>
        <span class="pcto-start">${pcto.start_date}</span>
        <span class="pcto-end">${pcto.end_date}</span>
        `;
        box.appendChild(div);
      });
      box.style.display = data.length ? "block" : "none";
    });
}

loadBacheca();

document.getElementById("pcto-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("pcto-title").value.trim();
  const desc = document.getElementById("pcto-desc").value.trim();
  const start = formatDateForDB(startSelected);
  const end = formatDateForDB(endSelected);

  title.value = "";
  desc.value = "";

  if (!title || !start || !end) {
    alert(
      "Per favore compila tutti i campi e seleziona un intervallo di date."
    );
    return;
  }

  fetch("database/add_pcto.php", {
    method: "POST",
    body: new URLSearchParams({ title, desc, start, end }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        loadBacheca();
      } else {
        alert("Errore: " + data.error);
      }
    });
});
