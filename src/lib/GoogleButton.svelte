<script>
  import { onMount } from 'svelte';
  import { loginWithGoogleCredential } from './auth.js';

  let {
    clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    width = 290,
    compact = false,
    onSuccess,
    onError
  } = $props();

  let container = $state(null);
  let loading = $state(false);

  onMount(() => {
    if (!clientId) return;

    // Lo script GIS è caricato in modo asincrono da app.html: si attende che sia pronto.
    const interval = setInterval(() => {
      if (window.google?.accounts?.id && container) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            hosted_domain: 'istitutoagnelli.it'
          });

          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width
          });
        } catch (err) {
          console.error('Inizializzazione Google:', err);
          onError?.('Impossibile inizializzare il login Google.');
        }
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.google?.accounts?.id) {
        onError?.('Impossibile caricare il login Google. Controlla la connessione e ricarica la pagina.');
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  });

  async function handleCredentialResponse(response) {
    loading = true;
    try {
      const profile = await loginWithGoogleCredential(response.credential);
      onSuccess?.(profile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore durante il login Google.';
      onError?.(msg);
    } finally {
      loading = false;
    }
  }

  function handleMissingClientId() {
    onError?.('Login Google non configurato: imposta VITE_GOOGLE_CLIENT_ID nel file .env.');
  }
</script>

<div class="google-btn-wrapper" class:compact>
  <div bind:this={container} class="gsi-container"></div>

  {#if !clientId}
    <button class="google-button" onclick={handleMissingClientId}>
      <span class="material-icons">account_circle</span>
      Accedi con Google
    </button>
  {/if}

  {#if loading}
    <p class="login-loading">Accesso in corso...</p>
  {/if}
</div>

<style>
  .google-btn-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 14px;
    gap: 12px;
  }

  .gsi-container {
    display: flex;
    justify-content: center;
    min-height: 44px;
    width: 100%;
  }

  /* versione per l'header: senza margini e larga quanto il bottone */
  .google-btn-wrapper.compact {
    width: auto;
    margin-top: 0;
    gap: 4px;
  }

  .google-btn-wrapper.compact .gsi-container {
    width: auto;
    min-height: 40px;
  }

  .login-loading {
    margin: 0;
    font-size: 14px;
    color: var(--muted-text, #666);
  }
</style>
