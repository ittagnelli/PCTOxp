<script>
  import { goto } from '$app/navigation';
  import GoogleButton from './GoogleButton.svelte';

  let { open = $bindable(false) } = $props();

  let errorMessage = $state('');

  function close() {
    open = false;
    errorMessage = '';
  }

  function handleBackdropClick(event) {
    // chiude solo se il click è sullo sfondo, non dentro la finestra
    if (event.target === event.currentTarget) close();
  }

  function handleLoginSuccess(profile) {
    close();
    goto(profile.ruolo === 'docente' ? '/bacheca/docente' : '/bacheca/studente');
  }

  function handleLoginError(error) {
    errorMessage = error;
  }
</script>

<svelte:window onkeydown={(event) => open && event.key === 'Escape' && close()} />

<!--
  Il popup resta sempre montato e viene solo nascosto: così il bottone di Google
  viene inizializzato una volta sola (initialize() non va richiamato più volte).
-->
<div class="login-backdrop" class:open onclick={handleBackdropClick} role="presentation">
  <div
    class="login-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="login-modal-title"
    aria-hidden={!open}
  >
    <button class="login-close" type="button" onclick={close} aria-label="Chiudi">
      <span class="material-icons">close</span>
    </button>

    <h2 id="login-modal-title">Accedi con Google</h2>
    <p class="login-info">Utilizza il tuo account istituzionale Agnelli per accedere</p>

    <GoogleButton onSuccess={handleLoginSuccess} onError={handleLoginError} />

    {#if errorMessage}
      <p class="login-error">{errorMessage}</p>
    {/if}
  </div>
</div>

<style>
  .login-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
  }

  .login-backdrop.open {
    display: flex;
  }

  .login-modal {
    position: relative;
    width: min(400px, 100%);
    box-sizing: border-box;
    padding: 32px 24px 28px;
    border-radius: 12px;
    background: var(--fsl-surface, #fff);
    color: var(--fsl-text, #111);
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .login-modal h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
  }

  .login-info {
    margin: 8px 0 0;
    font-size: 15px;
    color: var(--fsl-muted, #666);
  }

  .login-close {
    position: absolute;
    top: 8px;
    right: 8px;
    display: grid;
    place-items: center;
    padding: 6px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--fsl-text, #111);
    cursor: pointer;
  }

  .login-close:hover {
    background: rgba(128, 128, 128, 0.18);
  }

  .login-error {
    margin: 14px 0 0;
    font-weight: 500;
    color: #d32f2f;
  }
</style>
