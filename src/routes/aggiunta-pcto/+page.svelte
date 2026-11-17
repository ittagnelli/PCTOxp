<script>
  import { goto } from '$app/navigation';
  import { authHeaders, getProfile, AppLayout, CalendarPicker } from '$lib';
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
  let inviando = $state(false);

  async function submitPCTO() {
    if (inviando) return;

    if (!title.trim() || !description.trim() || !ente.trim() || !luogo.trim() || !startSelected || !endSelected || !maxStudenti || !ore) {
      alert('Per favore compila tutti i campi obbligatori (Titolo, Ente/Azienda, Luogo, Limite studenti, Ore, Date e Dettagli).');
      return;
    }

    inviando = true;
    try {
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
    } catch (err) {
      alert(`Errore: ${err instanceof Error ? err.message : 'Errore di rete'}`);
    } finally {
      inviando = false;
    }
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
  });
</script>

<svelte:head>
  <title>Aggiungi PCTO - PCTOxp</title>
</svelte:head>

<AppLayout
  {profile}
  title="Aggiungi PCTO"
  subtitle="Bacheca per i docenti"
  area="Area Docenti"
>
  <a class="fsl-btn light indietro" href="/bacheca/docente">
    <span class="material-icons">arrow_back</span>
    Torna ai PCTO
  </a>

  <form
    class="aggiunta"
    onsubmit={(event) => {
      event.preventDefault();
      submitPCTO();
    }}
  >
    <div class="campi">
      <label class="titolo-campo" for="pcto-title">Inserisci PCTO:</label>
      <input
        id="pcto-title"
        class="campo"
        type="text"
        placeholder="Titolo del PCTO"
        bind:value={title}
        required
      />

      <label class="titolo-campo" for="pcto-desc">Dettagli PCTO:</label>
      <textarea
        id="pcto-desc"
        class="campo"
        rows="4"
        placeholder="Descrizione delle attività e dettagli..."
        bind:value={description}
        required
      ></textarea>

      <div class="extra">
        <h2>Dati aggiuntivi</h2>

        <label class="etichetta" for="pcto-ente">Ente / Azienda</label>
        <input
          id="pcto-ente"
          class="campo"
          type="text"
          placeholder="Es. Politecnico di Torino, Comau..."
          bind:value={ente}
          required
        />

        <label class="etichetta" for="pcto-luogo">Luogo di svolgimento</label>
        <input
          id="pcto-luogo"
          class="campo"
          type="text"
          placeholder="Es. Laboratorio 3 / Sede aziendale"
          bind:value={luogo}
          required
        />

        <div class="coppia">
          <div>
            <label class="etichetta" for="pcto-max-studenti">Limite studenti</label>
            <input
              id="pcto-max-studenti"
              class="campo"
              type="number"
              min="1"
              max="500"
              placeholder="20"
              bind:value={maxStudenti}
              required
            />
          </div>
          <div>
            <label class="etichetta" for="pcto-ore">Ore totali</label>
            <input
              id="pcto-ore"
              class="campo"
              type="number"
              min="1"
              max="2000"
              placeholder="40"
              bind:value={ore}
              required
            />
          </div>
        </div>
      </div>
    </div>

    <div class="calendario">
      <CalendarPicker
        bind:startDate={startSelected}
        bind:endDate={endSelected}
        bind:startTime
        bind:endTime
      />
    </div>

    <button class="fsl-btn invio" type="submit" disabled={inviando}>
      {inviando ? 'Salvataggio...' : 'Inserisci PCTO'}
    </button>
  </form>
</AppLayout>

<style>
  .indietro {
    margin-bottom: 24px;
  }

  .aggiunta {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    grid-template-areas:
      'campi calendario'
      'invio calendario';
    grid-template-rows: auto 1fr;
    gap: 24px 40px;
    align-items: start;
  }

  .campi {
    grid-area: campi;
    display: flex;
    flex-direction: column;
  }

  .calendario {
    grid-area: calendario;
  }

  .invio {
    grid-area: invio;
    width: 100%;
    padding: 14px;
    font-size: 20px;
    font-weight: 700;
  }

  .titolo-campo {
    margin: 0 0 12px;
    font-size: 26px;
    font-weight: 700;
  }

  .campo {
    width: 100%;
    margin-bottom: 20px;
    padding: 14px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--fsl-text);
    font-size: 19px;
  }

  .campo::placeholder {
    color: var(--fsl-muted);
  }

  .campo:focus {
    outline: 2px solid var(--fsl-red);
    outline-offset: 0;
  }

  textarea.campo {
    min-height: 130px;
    margin-bottom: 36px;
    resize: vertical;
  }

  .extra {
    padding: 22px 24px 6px;
    border-radius: 10px;
    background: var(--fsl-surface);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  }

  .extra h2 {
    margin: 0 0 14px;
    font-size: 20px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .etichetta {
    display: block;
    margin-bottom: 6px;
    font-size: 20px;
    font-weight: 500;
  }

  .coppia {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;
  }

  @media (max-width: 1000px) {
    .aggiunta {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'campi'
        'calendario'
        'invio';
      grid-template-rows: none;
    }
  }

  @media (max-width: 560px) {
    .coppia {
      grid-template-columns: 1fr;
    }

    .titolo-campo {
      font-size: 22px;
    }
  }
</style>
