<script>
  import { goto } from '$app/navigation';
  import { authHeaders, getProfile, AppLayout } from '$lib';
  import { formatDate, toInputDate } from '$lib/format.js';
  import { onMount } from 'svelte';

  let profile = $state(null);
  let pcto = $state([]);
  let iscrizioniMap = $state({});
  let loading = $state(true);
  let errorMessage = $state('');
  let apertoId = $state(null);

  const oggi = () => toInputDate(new Date());

  // PCTO senza creatore (docente rimosso): gestibile da qualunque docente
  const isOwner = (p) => !p.created_by || p.created_by === profile?.id;
  const isConcluso = (p) => p.end_date < oggi();
  const postiMax = (p) => p.max_studenti || 20;
  const docenteDi = (p) => p.docente_nome || p.docente_email || 'Docente Istituto Agnelli';
  const studentiFor = (id) => iscrizioniMap[id] ?? [];

  function toggleIscritti(id) {
    apertoId = apertoId === id ? null : id;
  }

  async function requireTeacher() {
    const userProfile = await getProfile();
    if (!userProfile) {
      goto('/login');
      return false;
    }

    if (userProfile.ruolo !== 'docente') {
      goto('/bacheca/studente');
      return false;
    }

    profile = userProfile;
    return true;
  }

  async function loadBacheca() {
    loading = true;
    errorMessage = '';

    if (!(await requireTeacher())) {
      loading = false;
      return;
    }

    try {
      const [pctoRes, iscrizioniRes] = await Promise.all([
        fetch('/api/pcto'),
        fetch('/api/iscrizioni/studenti', { headers: authHeaders() })
      ]);

      if (!pctoRes.ok || !iscrizioniRes.ok) {
        throw new Error('Errore durante il recupero dei dati.');
      }

      pcto = await pctoRes.json();
      const iscrizioniJson = await iscrizioniRes.json();

      const map = {};
      if (iscrizioniJson.data) {
        for (const item of iscrizioniJson.data) {
          map[item.pcto_id] = item.studenti_iscritti;
        }
      }
      iscrizioniMap = map;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Errore database.';
    } finally {
      loading = false;
    }
  }

  async function deletePCTO(id) {
    if (!confirm('Sei sicuro di voler eliminare questo PCTO?')) return;

    try {
      const res = await fetch(`/api/pcto/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!data.success) {
        alert(`Errore: ${data.error ?? 'Operazione fallita'}`);
        return;
      }
      if (apertoId === id) apertoId = null;
      await loadBacheca();
    } catch (err) {
      alert(`Errore: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`);
    }
  }

  onMount(() => {
    loadBacheca();
  });
</script>

<svelte:head>
  <title>Bacheca Docenti - PCTOxp</title>
</svelte:head>

<AppLayout {profile} title="Bacheca per i docenti" area="Area Docenti">
  <div class="testata">
    <h1>Gestione dei PCTO</h1>
    <a class="fsl-btn" href="/aggiunta-pcto">
      <span class="material-icons">add</span>
      Aggiungi Nuovo PCTO
    </a>
  </div>

  {#if loading}
    <p class="stato">Caricamento...</p>
  {:else if errorMessage}
    <p class="stato">{errorMessage}</p>
  {:else if pcto.length === 0}
    <p class="stato">Nessun PCTO disponibile al momento.</p>
  {:else}
    <div class="tabella-wrap">
      <table class="tabella">
        <thead>
          <tr>
            <th>Nome PCTO</th>
            <th>Azienda</th>
            <th>Ore</th>
            <th>Studenti Iscritti</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {#each pcto as item (item.id)}
            {@const owner = isOwner(item)}
            {@const numIscritti = Number(item.num_iscritti ?? 0)}
            <tr>
              <td data-label="Nome PCTO">
                <div class="nome">{item.title}</div>
                <div class="sub">
                  {formatDate(item.start_date)} – {formatDate(item.end_date)}
                  {#if isConcluso(item)}<span class="fsl-badge muted">Concluso</span>{/if}
                </div>
                <div class="sub">Docente: {docenteDi(item)}</div>
              </td>
              <td data-label="Azienda">{item.ente || '—'}</td>
              <td data-label="Ore">{item.ore ?? '—'}</td>
              <td data-label="Studenti Iscritti">
                <span>{numIscritti} / {postiMax(item)} Iscritti</span>
                {#if owner && numIscritti > 0}
                  <button class="link" type="button" onclick={() => toggleIscritti(item.id)}>
                    ({apertoId === item.id ? 'Nascondi iscritti' : 'Vedi iscritti'})
                  </button>
                {/if}
              </td>
              <td data-label="Azioni">
                {#if owner}
                  <button class="fsl-btn" type="button" onclick={() => deletePCTO(item.id)}>
                    <span class="material-icons">delete</span>
                    Elimina
                  </button>
                {:else}
                  <span class="riservato">
                    <span class="material-icons">lock</span>
                    Riservato a {docenteDi(item)}
                  </span>
                {/if}
              </td>
            </tr>

            {#if owner && apertoId === item.id}
              <tr class="espansa">
                <td colspan="5">
                  <div class="iscritti-box">
                    <div class="iscritti-head">
                      <strong>Iscritti a: {item.title}</strong>
                      <button class="link" type="button" onclick={() => (apertoId = null)}>Chiudi</button>
                    </div>
                    <ul>
                      {#each studentiFor(item.id) as studente}
                        <li>{studente}</li>
                      {/each}
                    </ul>
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</AppLayout>

<style>
  .testata {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 26px;
  }

  .testata h1 {
    margin: 0;
    font-size: 36px;
    font-weight: 700;
    color: var(--fsl-muted);
  }

  .stato {
    color: var(--fsl-muted);
    font-size: 18px;
  }

  .tabella-wrap {
    overflow: hidden;
    border-radius: 10px;
    background: var(--fsl-surface);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  }

  .tabella {
    width: 100%;
    border-collapse: collapse;
    font-size: 19px;
  }

  .tabella thead th {
    padding: 16px 24px;
    background: rgba(128, 128, 128, 0.22);
    font-size: 21px;
    font-weight: 700;
    text-align: left;
  }

  .tabella td {
    padding: 18px 24px;
    border-top: 1px solid var(--border-color);
    vertical-align: middle;
  }

  .tabella tbody tr:first-child td {
    border-top: none;
  }

  .nome {
    font-weight: 500;
  }

  .sub {
    margin-top: 4px;
    font-size: 14px;
    color: var(--fsl-muted);
  }

  .sub :global(.fsl-badge) {
    margin-left: 6px;
    padding: 1px 10px;
    font-size: 12px;
  }

  .link {
    padding: 0;
    border: none;
    background: none;
    color: var(--fsl-red);
    font-size: inherit;
    cursor: pointer;
  }

  .link:hover {
    text-decoration: underline;
  }

  .riservato {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    color: var(--fsl-muted);
  }

  .riservato .material-icons {
    font-size: 18px;
  }

  .tabella tr.espansa td {
    padding: 0 24px 18px;
    border-top: none;
  }

  .iscritti-box {
    padding: 14px 18px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--btn-bg);
  }

  .iscritti-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 18px;
  }

  .iscritti-box ul {
    margin: 0;
    padding: 0;
    list-style: none;
    columns: 2 220px;
    font-size: 17px;
  }

  .iscritti-box li {
    padding: 4px 0;
  }

  @media (max-width: 900px) {
    .testata h1 {
      font-size: 26px;
    }

    .tabella,
    .tabella tbody,
    .tabella tr,
    .tabella td {
      display: block;
      width: 100%;
    }

    .tabella thead {
      display: none;
    }

    .tabella tbody tr:not(.espansa) {
      padding: 12px 0;
      border-top: 1px solid var(--border-color);
    }

    .tabella tbody tr:first-child {
      border-top: none;
    }

    .tabella td {
      padding: 6px 16px;
      border-top: none;
      font-size: 17px;
    }

    .tabella td[data-label]::before {
      content: attr(data-label);
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--fsl-muted);
    }

    .tabella tr.espansa td {
      padding: 0 16px 14px;
    }
  }
</style>
