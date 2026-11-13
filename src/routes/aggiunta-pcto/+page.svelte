<script>
  import { goto } from '$app/navigation';
  import { authHeaders, getProfile, Navbar, CalendarPicker } from '$lib';
  import { onMount } from 'svelte';

  let profile = $state(null);
  let title = $state('');
  let description = $state('');
  let ente = $state('');
  let luogo = $state('');
  let maxStudenti = $state(20);
  let ore = $state(null);
  let startSelected = $state(null);
  let endSelected = $state(null);
  let startTime = $state('08:30');
  let endTime = $state('12:30');

  let bachecaEl = $state(null);
  let isBachecaVisible = $state(false);
  let isMobile = $state(false);

  const isFloatingSubmit = $derived(isMobile && !isBachecaVisible);

  async function submitPCTO() {
    if (!title.trim() || !description.trim() || !ente.trim() || !luogo.trim() || !startSelected || !endSelected || !maxStudenti || !ore) {
      alert('Per favore compila tutti i campi obbligatori (Titolo, Ente/Azienda, Luogo, Limite studenti, Ore, Date e Dettagli).');
      return;
    }

    const response = await fetch('/api/pcto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({
        title,
        description,
        ente,
        luogo,
        max_studenti: maxStudenti,
        ore,
        start_date: startSelected,
        end_date: endSelected,
        start_time: startTime || '08:30',
        end_time: endTime || '12:30'
      })
    });

    const data = await response.json();
    if (!data.success) {
      alert(`Errore: ${data.error ?? 'operazione fallita'}`);
      return;
    }

    title = '';
    description = '';
    ente = '';
    luogo = '';
    maxStudenti = 20;
    ore = null;
    startSelected = null;
    endSelected = null;
    startTime = '08:30';
    endTime = '12:30';
    alert('PCTO aggiunto con successo!');
  }

  onMount(async () => {
    const userProfile = await getProfile();
    if (!userProfile) {
      goto('/login');
      return;
    }
    if (userProfile.ruolo !== 'docente') {
      goto('/bacheca/studente');
      return;
    }

    profile = userProfile;

    const updateMobile = () => {
      isMobile = window.innerWidth <= 1024;
    };
    updateMobile();
    window.addEventListener('resize', updateMobile);

    let observer;
    if (bachecaEl && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isBachecaVisible = entry.isIntersecting;
          }
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0
        }
      );
      observer.observe(bachecaEl);
    }

    return () => {
      window.removeEventListener('resize', updateMobile);
      if (observer) observer.disconnect();
    };
  });
</script>

<svelte:head>
  <title>Aggiungi PCTO - PCTOxp</title>
</svelte:head>

<main class="app-shell add-shell">
  <Navbar {profile} showTeacherLinks />

  <section class="input-container">
    <form id="pcto-form" onsubmit={(event) => { event.preventDefault(); submitPCTO(); }}>
      <h3 class="PCTO">Inserisci PCTO:</h3>
      <input type="text" name="PCTO" id="pcto-title" placeholder="Titolo del PCTO" bind:value={title} required />

      <h3 class="details">Dettagli PCTO:</h3>
      <textarea id="pcto-desc" rows="4" placeholder="Descrizione delle attività e dettagli..." bind:value={description} required></textarea>
    </form>
  </section>

  <CalendarPicker
    bind:startDate={startSelected}
    bind:endDate={endSelected}
    bind:startTime={startTime}
    bind:endTime={endTime}
  />

  <div class="mobile-submit-container" class:floating={isFloatingSubmit}>
    <button type="submit" form="pcto-form" class="submit-mobile-btn">Inserisci pcto</button>
  </div>

  <section class="mini-bacheca" bind:this={bachecaEl}>
    <div class="extra-fields-card">
      <h4>Dati aggiuntivi</h4>
      <div class="extra-fields-grid">
        <div class="full-width">
          <label class="input-label" for="pcto-ente">Ente / Azienda</label>
          <input type="text" id="pcto-ente" class="text-input" placeholder="Es. Politecnico di Torino, Comau..." bind:value={ente} form="pcto-form" required />
        </div>
        <div class="full-width">
          <label class="input-label" for="pcto-luogo">Luogo di svolgimento</label>
          <input type="text" id="pcto-luogo" class="text-input" placeholder="Es. Laboratorio 3 / Sede aziendale" bind:value={luogo} form="pcto-form" required />
        </div>
        <div>
          <label class="input-label" for="pcto-max-studenti">Limite studenti</label>
          <input type="number" id="pcto-max-studenti" class="text-input" min="1" max="500" placeholder="20" bind:value={maxStudenti} form="pcto-form" required />
        </div>
        <div>
          <label class="input-label" for="pcto-ore">Ore totali</label>
          <input type="number" id="pcto-ore" class="text-input" min="1" max="2000" placeholder="40" bind:value={ore} form="pcto-form" required />
        </div>
      </div>
    </div>
    <button type="submit" form="pcto-form" class="submit-extra-btn">Inserisci PCTO</button>
  </section>
</main>
