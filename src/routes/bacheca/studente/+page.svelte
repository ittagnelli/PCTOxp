<script>
  import { goto } from '$app/navigation';
  import { authHeaders, getProfile, AppLayout, AgnelliMark } from '$lib';
  import { formatDate, toInputDate } from '$lib/format.js';
  import { onMount } from 'svelte';

  const MAX_ISCRIZIONI = 5;

  let profile = $state(null);
  let pcto = $state([]);
  let iscrizioni = $state([]);
  let loading = $state(true);
  let errorMessage = $state('');
  let aperti = $state({});

  const oggi = () => toInputDate(new Date());

  const mieiPcto = $derived(pcto.filter((p) => iscrizioni.includes(p.id)));
  const disponibili = $derived(
    pcto.filter((p) => !iscrizioni.includes(p.id) && p.end_date >= oggi())
  );
  const maxRaggiunto = $derived(iscrizioni.length >= MAX_ISCRIZIONI);

  const postiMax = (p) => p.max_studenti || 20;
  const isFull = (p) => Number(p.num_iscritti) >= postiMax(p);
  const isConcluso = (p) => p.end_date < oggi();
  const docenteDi = (p) => p.docente_nome || p.docente_email || 'Docente Istituto Agnelli';
  const orarioDi = (p) => (p.start_time && p.end_time ? `${p.start_time} - ${p.end_time}` : '—');

  function toggleDettagli(id) {
    aperti[id] = !aperti[id];
  }

  async function requireStudent() {
    const userProfile = await getProfile();
    if (!userProfile) {
      goto('/login');
      return false;
    }

    if (userProfile.ruolo === 'docente') {
      goto('/bacheca/docente');
      return false;
    }

    profile = userProfile;
    return true;
  }

  async function loadBacheca() {
    loading = true;
    errorMessage = '';

    if (!(await requireStudent()) || !profile) {
      loading = false;
      return;
    }

    try {
      const [pctoRes, iscrizioniRes] = await Promise.all([
        fetch('/api/pcto'),
        fetch('/api/iscrizioni', { headers: authHeaders() })
      ]);

      if (!pctoRes.ok || !iscrizioniRes.ok) {
        throw new Error('Errore durante il recupero dei dati.');
      }

      pcto = await pctoRes.json();
      const iscrizioniData = await iscrizioniRes.json();
      iscrizioni = (iscrizioniData.iscrizioni ?? []).map((id) => Number(id));
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Errore database.';
    } finally {
      loading = false;
    }
  }

  async function subscribe(id) {
    if (!profile) return;

    if (iscrizioni.length >= MAX_ISCRIZIONI) {
      alert(`Hai già raggiunto il limite massimo consentito di ${MAX_ISCRIZIONI} PCTO.`);
      return;
    }

    try {
      const res = await fetch('/api/iscrizioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ pcto_id: id, action: 'iscriviti' })
      });
      const data = await res.json();
      if (!data.success) {
        alert(`Errore: ${data.error ?? 'Operazione fallita'}`);
        return;
      }
      await loadBacheca();
    } catch (err) {
      alert(`Errore: ${err instanceof Error ? err.message : 'Errore di rete'}`);
    }
  }

  async function unsubscribe(id) {
    if (!profile) return;

    try {
      const res = await fetch('/api/iscrizioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ pcto_id: id, action: 'disiscrivi' })
      });
      const data = await res.json();
      if (!data.success) {
        alert(`Errore: ${data.error ?? 'Operazione fallita'}`);
        return;
      }
      await loadBacheca();
    } catch (err) {
      alert(`Errore: ${err instanceof Error ? err.message : 'Errore di rete'}`);
    }
  }

  onMount(() => {
    loadBacheca();
  });
</script>

<svelte:head>
  <title>Bacheca Studenti - PCTOxp</title>
</svelte:head>

{#snippet dettagli(item, conDescrizione = false)}
  <div class="dettagli">
    {#if conDescrizione}
      <p class="dettagli-desc">{item.description}</p>
    {/if}
    <dl>
      <div><dt>Docente</dt><dd>{docenteDi(item)}</dd></div>
      <div><dt>Luogo</dt><dd>{item.luogo || '—'}</dd></div>
      <div><dt>Date</dt><dd>{formatDate(item.start_date)} → {formatDate(item.end_date)}</dd></div>
      <div><dt>Orario</dt><dd>{orarioDi(item)}</dd></div>
      <div><dt>Posti</dt><dd>{item.num_iscritti} / {postiMax(item)}</dd></div>
    </dl>
  </div>
{/snippet}

<AppLayout {profile} title="Bacheca Studenti" area="Area Studenti">
  <h1 class="titolo-pagina">I miei PCTO e Nuove Iscrizioni</h1>

  {#if loading}
    <p class="stato">Caricamento...</p>
  {:else if errorMessage}
    <p class="stato">{errorMessage}</p>
  {:else}
    <section class="sezione" id="miei">
      <div class="sezione-head">
        <h2>I tuoi PCTO attivi</h2>
        <span class="contatore">
          Iscrizioni attive: <strong>{iscrizioni.length} / {MAX_ISCRIZIONI}</strong>
        </span>
      </div>

      {#if mieiPcto.length === 0}
        <p class="stato">Non sei ancora iscritto a nessun PCTO.</p>
      {:else}
        <div class="righe">
          {#each mieiPcto as item (item.id)}
            <article class="riga">
              <div class="riga-titolo">
                <h3>{item.title}</h3>
                <p>Azienda: {item.ente || '—'}</p>
              </div>
              <span class="riga-ore">Ore: {item.ore ?? '—'}</span>
              {#if isConcluso(item)}
                <span class="fsl-badge muted">Concluso</span>
              {:else}
                <span class="fsl-badge">Iscritto</span>
              {/if}
              <button class="fsl-btn light" type="button" onclick={() => toggleDettagli(item.id)}>
                Dettagli
              </button>
              {#if !isConcluso(item)}
                <button class="fsl-btn" type="button" onclick={() => unsubscribe(item.id)}>
                  <span class="material-icons">cancel</span>
                  Disiscriviti
                </button>
              {/if}

              {#if aperti[item.id]}
                <div class="riga-dettagli">{@render dettagli(item, true)}</div>
              {/if}
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <section class="sezione" id="tutti">
      <div class="sezione-head">
        <h2>PCTO Disponibili per l'Iscrizione</h2>
      </div>

      {#if disponibili.length === 0}
        <p class="stato">Nessun PCTO disponibile al momento.</p>
      {:else}
        <div class="griglia">
          {#each disponibili as item, i (item.id)}
            <article class="card">
              <header class="card-head">
                <h3>{item.title}</h3>
                <span class="card-mark" class:grigia={i % 2 === 1}>
                  <AgnelliMark size={36} />
                </span>
              </header>

              <div class="card-riga">
                <span>Azienda: {item.ente || '—'}</span>
                <span>Ore: {item.ore ?? '—'}</span>
              </div>

              <p class="card-desc">{item.description}</p>

              <p class="card-info">
                {formatDate(item.start_date)} – {formatDate(item.end_date)} ·
                Posti {item.num_iscritti}/{postiMax(item)}
              </p>

              <button class="card-dettagli" type="button" onclick={() => toggleDettagli(item.id)}>
                {aperti[item.id] ? 'Nascondi dettagli' : 'Dettagli'}
              </button>
              {#if aperti[item.id]}
                {@render dettagli(item)}
              {/if}

              <button
                class="fsl-btn card-btn"
                type="button"
                disabled={isFull(item) || maxRaggiunto}
                onclick={() => subscribe(item.id)}
              >
                {#if isFull(item)}
                  Posti esauriti
                {:else if maxRaggiunto}
                  Max {MAX_ISCRIZIONI} raggiunto
                {:else}
                  Iscriviti
                {/if}
              </button>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</AppLayout>

<style>
  .titolo-pagina {
    margin: 0 0 28px;
    font-size: 34px;
    font-weight: 500;
    color: var(--fsl-muted);
  }

  .stato {
    color: var(--fsl-muted);
    font-size: 18px;
  }

  .sezione {
    margin-bottom: 40px;
    scroll-margin-top: 16px;
  }

  .sezione-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px 16px;
    margin-bottom: 14px;
  }

  .sezione-head h2 {
    margin: 0;
    font-size: 27px;
    font-weight: 700;
  }

  .contatore {
    font-size: 16px;
    color: var(--fsl-muted);
  }

  .contatore strong {
    color: var(--fsl-text);
  }

  /* ------------------------------------------------ i tuoi PCTO */
  .righe {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .riga {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 22px;
    padding: 16px 22px;
    border-radius: 10px;
    background: var(--fsl-surface);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  }

  .riga-titolo {
    flex: 1 1 220px;
    min-width: 0;
  }

  .riga-titolo h3 {
    margin: 0;
    font-size: 23px;
    font-weight: 500;
  }

  .riga-titolo p {
    margin: 4px 0 0;
    font-size: 18px;
  }

  .riga-ore {
    font-size: 19px;
  }

  .riga-dettagli {
    flex-basis: 100%;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
  }

  /* ------------------------------------------------ PCTO disponibili */
  .griglia {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  .card {
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-radius: 10px;
    background: var(--fsl-surface);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  }

  .card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .card-head h3 {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.2;
  }

  .card-mark {
    flex-shrink: 0;
    color: var(--fsl-red);
  }

  .card-mark.grigia {
    color: var(--fsl-grey-btn);
  }

  .card-riga {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 12px;
    margin-top: 12px;
    font-size: 17px;
  }

  .card-desc {
    margin: 12px 0 0;
    font-size: 18px;
    line-height: 1.35;
    white-space: pre-line;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-info {
    margin: 10px 0 0;
    font-size: 15px;
    color: var(--fsl-muted);
  }

  .card-dettagli {
    align-self: flex-start;
    margin: 6px 0 14px;
    padding: 0;
    border: none;
    background: none;
    color: var(--fsl-red);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
  }

  .card-dettagli:hover {
    text-decoration: underline;
  }

  .card-btn {
    margin-top: auto;
    width: 100%;
    padding: 12px;
    font-size: 19px;
  }

  .card .dettagli {
    margin: 0 0 14px;
  }

  /* ------------------------------------------------ dettagli (comuni) */
  .dettagli-desc {
    margin: 0 0 10px;
    font-size: 17px;
    line-height: 1.4;
    white-space: pre-line;
  }

  .dettagli dl {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px 18px;
    margin: 0;
  }

  .dettagli dl div {
    display: flex;
    flex-direction: column;
  }

  .dettagli dt {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--fsl-muted);
  }

  .dettagli dd {
    margin: 2px 0 0;
    font-size: 16px;
  }

  @media (max-width: 1250px) {
    .griglia {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .titolo-pagina {
      font-size: 26px;
    }

    .sezione-head h2 {
      font-size: 22px;
    }

    .griglia {
      grid-template-columns: minmax(0, 1fr);
    }

    .riga {
      padding: 14px 16px;
    }
  }
</style>
