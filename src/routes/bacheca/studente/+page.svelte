<script>
  import { goto } from '$app/navigation';
  import { authHeaders, getProfile, Navbar, PctoCard } from '$lib';
  import { onMount } from 'svelte';

  let profile = $state(null);
  let pcto = $state([]);
  let iscrizioni = $state([]);
  let loading = $state(true);
  let errorMessage = $state('');

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

    if (iscrizioni.length >= 5) {
      alert('Hai già raggiunto il limite massimo consentito di 5 PCTO.');
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
  <title>Bacheca Studente - PCTOxp</title>
</svelte:head>

<main class="app-shell">
  <Navbar {profile} />
  <section class="bacheca-content">
    <div class="student-status-bar">
      <span class="status-counter">
        <span class="material-icons" style="font-size: 18px; vertical-align: middle;">fact_check</span>
        Iscrizioni attive: <strong>{iscrizioni.length} / 5</strong>
      </span>
      {#if iscrizioni.length >= 5}
        <span class="status-limit-badge">Hai raggiunto il massimo di 5 PCTO</span>
      {/if}
    </div>

    <div id="pcto-info-box">
      {#if loading}
        <p>Caricamento...</p>
      {:else if errorMessage}
        <p class="empty-state">{errorMessage}</p>
      {:else if pcto.length === 0}
        <p>Nessun PCTO disponibile al momento.</p>
      {:else}
        {#each pcto as item (item.id)}
          <PctoCard
            pcto={item}
            mode="studente"
            iscritto={iscrizioni.includes(item.id)}
            hasMaxEnrollments={iscrizioni.length >= 5}
            onSubscribe={subscribe}
            onUnsubscribe={unsubscribe}
          />
        {/each}
      {/if}
    </div>
  </section>
</main>

<style>
  .student-status-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 10px 16px;
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    font-size: 14px;
    width: fit-content;
  }
  .status-counter {
    color: var(--text-color, #333);
  }
  .status-limit-badge {
    background: #e65100;
    color: #fff;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }
</style>
