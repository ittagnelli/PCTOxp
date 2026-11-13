<script>
  import { goto } from '$app/navigation';
  import { getProfile } from '$lib/auth';
  import { onMount } from 'svelte';

  onMount(async () => {
    const profile = await getProfile();
    if (profile) {
      goto(profile.ruolo === 'docente' ? '/bacheca/docente' : '/bacheca/studente');
    } else {
      goto('/login');
    }
  });
</script>

<svelte:head>
  <title>Accesso - PCTOxp</title>
</svelte:head>

<main class="login-page">
  <div class="login-container">
    <div class="logo">
      <img src="/assets/logo/logo_PCTOxp.png" alt="Logo PCTOxp" />
    </div>
    <h2>Reindirizzamento in corso...</h2>
  </div>
</main>
