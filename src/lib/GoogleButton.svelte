<script>
  import { onMount } from 'svelte';
  import { loginWithGoogleCredential } from './auth.js';

  let {
    clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    onSuccess,
    onError
  } = $props();

  let container = $state(null);
  let loading = $state(false);
  let isMobileOrLan = $state(false);
  let manualEmail = $state('');

  onMount(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      isMobileOrLan = hostname !== 'localhost' && hostname !== '127.0.0.1';
    }

    initGoogleGIS();
  });

  function initGoogleGIS() {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      if (window.google?.accounts?.id && container) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: clientId || 'mock-client-id.apps.googleusercontent.com',
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
            width: 290
          });
        } catch (err) {
          console.error('Inizializzazione Google:', err);
        }
      }
    }, 200);

    setTimeout(() => clearInterval(interval), 4000);
  }

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

  async function handleLanMobileLogin(e) {
    e?.preventDefault();
    if (!manualEmail.trim()) {
      onError?.('Inserisci la tua email @istitutoagnelli.it');
      return;
    }

    loading = true;
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: manualEmail.trim() })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Accesso non riuscito.');
      }
      localStorage.setItem('pctoxp_token', data.token);
      onSuccess?.(data.profile);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Errore durante l\'accesso.');
    } finally {
      loading = false;
    }
  }

  function handlePrompt() {
    if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.prompt();
    } else if (!clientId) {
      onError?.('Inserisci il Google Client ID in .env (VITE_GOOGLE_CLIENT_ID).');
    }
  }
</script>

<div class="google-btn-wrapper">
  <div bind:this={container} class="gsi-container"></div>

  {#if !clientId}
    <button class="google-button" onclick={handlePrompt} disabled={loading}>
      <span class="material-icons">account_circle</span>
      {loading ? 'Reindirizzamento...' : 'Accedi con Google'}
    </button>
  {/if}

  {#if isMobileOrLan}
    <div class="lan-mobile-notice">
      <p class="lan-help">
        <span class="material-icons" style="font-size: 16px; vertical-align: middle;">phone_iphone</span>
        Accesso rapido da smartphone / tablet (Wi-Fi locale):
      </p>
      <form onsubmit={handleLanMobileLogin} class="lan-form">
        <input
          type="email"
          placeholder="nome.cognome@istitutoagnelli.it"
          bind:value={manualEmail}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Accesso...' : 'Accedi da Dispositivo'}
        </button>
      </form>
    </div>
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

  .lan-mobile-notice {
    width: 100%;
    background: var(--btn-bg, #f8f9fa);
    border: 1px dashed var(--border-color, #ccc);
    border-radius: 8px;
    padding: 12px;
    box-sizing: border-box;
    text-align: left;
    margin-top: 8px;
  }

  .lan-help {
    font-size: 12px;
    color: var(--muted-text, #666);
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .lan-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .lan-form input {
    padding: 10px;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 6px;
    font-size: 14px;
    background: var(--input-bg, #fff);
    color: var(--text-color, #111);
    box-sizing: border-box;
  }

  .lan-form button {
    padding: 10px;
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }

  .lan-form button:hover {
    background: #1565c0;
  }
</style>
