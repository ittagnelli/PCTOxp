<script>
  import { goto } from '$app/navigation';
  import { authHeaders, getProfile, Navbar, PctoCard } from '$lib';
  import { onMount } from 'svelte';

  let profile = $state(null);
  let pcto = $state([]);
  let iscrizioniMap = $state({});
  let loading = $state(true);
  let errorMessage = $state('');

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

  function studentiFor(id) {
    return iscrizioniMap[id] ?? [];
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
  <title>Bacheca Docente - PCTOxp</title>
</svelte:head>

<main class="app-shell">
  <Navbar {profile} showTeacherLinks />
  <section class="bacheca-content">
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
            mode="docente"
            currentUserId={profile?.id}
            studenti={studentiFor(item.id)}
            onDelete={deletePCTO}
          />
        {/each}
      {/if}
    </div>
  </section>
</main>
