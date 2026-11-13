<script>
  import { goto } from '$app/navigation';
  import { getProfile, GoogleButton } from '$lib';
  import { onMount } from 'svelte';

  let errorMessage = $state('');

  onMount(async () => {
    const profile = await getProfile();
    if (profile) {
      goto(profile.ruolo === 'docente' ? '/bacheca/docente' : '/bacheca/studente');
    }
  });

  function handleLoginSuccess(profile) {
    goto(profile.ruolo === 'docente' ? '/bacheca/docente' : '/bacheca/studente');
  }

  function handleLoginError(error) {
    errorMessage = error;
  }
</script>

<svelte:head>
  <title>Login - PCTOxp</title>
</svelte:head>

<main class="login-page">
  <div class="login-container">
    <div class="logo">
      <img src="/assets/logo/logo_PCTOxp.png" alt="Logo PCTOxp" />
    </div>

    <h2>Accedi con Google</h2>
    <p class="info-text">Utilizza il tuo account istituzionale agnelli per accedere</p>

    <GoogleButton onSuccess={handleLoginSuccess} onError={handleLoginError} />

    {#if errorMessage}
      <p class="form-error" style="color: #d32f2f; margin-top: 14px; font-weight: 500;">
        {errorMessage}
      </p>
    {/if}
  </div>
</main>
