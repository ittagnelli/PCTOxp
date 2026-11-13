export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function meseAnno(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return capitalize(date.toLocaleString('it-IT', { month: 'long', year: 'numeric' }));
}

/** "Gennaio 2027", oppure "Gennaio – Marzo 2027" se il PCTO copre più mesi. */
export function formatPeriodo(startDate, endDate) {
  if (!startDate) return '';
  const inizio = meseAnno(startDate);
  if (!endDate) return inizio;
  const fine = meseAnno(endDate);
  if (inizio === fine) return inizio;
  const [meseInizio, annoInizio] = inizio.split(' ');
  const [, annoFine] = fine.split(' ');
  return annoInizio === annoFine ? `${meseInizio} – ${fine}` : `${inizio} – ${fine}`;
}
