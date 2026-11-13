<script>
  import { getProfile, Navbar, PctoCard } from '$lib';
  import { onMount } from 'svelte';

  let profile = $state(null);
  let pcto = $state([]);
  let loading = $state(true);
  let errorMessage = $state('');

  async function loadBacheca() {
    loading = true;
    errorMessage = '';

    try {
      profile = await getProfile();
      const res = await fetch('/api/pcto');
      if (!res.ok) throw new Error('Impossibile caricare i PCTO.');
      pcto = await res.json();
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Errore durante il caricamento.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadBacheca();
  });
</script>

<svelte:head>
  <title>Bacheca PCTO</title>
</svelte:head>

<main class="app-shell">
  <Navbar {profile} showLogin={!profile} showTeacherLinks={profile?.ruolo === 'docente'} />
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
          <PctoCard pcto={item} />
        {/each}
      {/if}
    </div>
  </section>
</main>
