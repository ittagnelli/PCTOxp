<script>
  import { goto } from '$app/navigation';
  import AgnelliMark from './AgnelliMark.svelte';
  import GoogleButton from './GoogleButton.svelte';
  import { logout } from './auth.js';

  let {
    profile = null,
    subtitle = "Bacheca pubblica - La piattaforma per i PCTO e la formazione dell'Istituto Agnelli"
  } = $props();

  let loginError = $state('');

  // larghezza (px) del bottone di login: Google accetta valori tra 200 e 400
  const LOGIN_WIDTH = 240;

  const bachecaHref = $derived(profile?.ruolo === 'docente' ? '/bacheca/docente' : '/bacheca/studente');

  function handleLoginSuccess(user) {
    loginError = '';
    goto(user.ruolo === 'docente' ? '/bacheca/docente' : '/bacheca/studente');
  }

  async function handleLogout() {
    await logout();
    window.location.href = '/bacheca';
  }
</script>

<header class="site-header">
  <a class="brand-istituto" href="/bacheca" aria-label="Istituto Agnelli - Home">
    <AgnelliMark size={76} class="brand-mark" />
    <span class="brand-testo">
      <span class="brand-agnelli">Agnelli</span>
      <span class="brand-salesiani"><b>SALESIANI</b>DONBOSCO</span>
      <span class="brand-torino">TORINO</span>
    </span>
  </a>

  <div class="brand-app">
    <h1 class="app-title">FSL<span>xp</span></h1>
    <p class="app-subtitle">{subtitle}</p>
  </div>

  <div class="header-actions">
    {#if profile}
      <a class="header-google-btn" href={bachecaHref}>
        <span class="g-box"><span class="material-icons">dashboard</span></span>
        <span class="g-label">La mia bacheca</span>
      </a>
      <button class="header-icon-btn" onclick={handleLogout} title="Esci" aria-label="Esci">
        <span class="material-icons">logout</span>
      </button>
    {:else}
      <div class="header-login" style="width: {LOGIN_WIDTH}px">
        <!-- Aspetto: bottone nello stile del sito (solo grafica) -->
        <div class="header-google-btn login-visual" aria-hidden="true">
          <span class="g-box">
            <svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/>
              <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6.1z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-4.9 2.3-8.2 2.3-6.2 0-11.5-4.2-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/>
            </svg>
          </span>
          <span class="g-label">Accedi con Google</span>
        </div>

        <!-- Funzionamento: il bottone ufficiale di Google, trasparente, sopra la grafica -->
        <div class="login-overlay">
          <div class="login-scale">
            <GoogleButton
              compact
              width={LOGIN_WIDTH}
              onSuccess={handleLoginSuccess}
              onError={(message) => (loginError = message)}
            />
          </div>
        </div>

        {#if loginError}
          <p class="login-error">{loginError}</p>
        {/if}
      </div>
    {/if}
  </div>
</header>

<style>
  .site-header {
    display: flex;
    align-items: center;
    gap: 28px;
    padding: 18px 48px 18px 30px;
    background: var(--fsl-surface);
    color: var(--fsl-text);
  }

  .brand-istituto {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: var(--fsl-red);
    flex-shrink: 0;
  }

  .brand-testo {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .brand-agnelli {
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--fsl-brand-grey);
    padding-bottom: 3px;
    border-bottom: 2px solid var(--fsl-brand-grey);
  }

  .brand-salesiani {
    margin-top: 4px;
    font-size: 10.5px;
    color: var(--fsl-brand-grey);
    letter-spacing: 0.1px;
  }

  .brand-torino {
    margin-top: 3px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 5px;
    color: var(--fsl-red);
  }

  .brand-app {
    min-width: 0;
    flex: 1;
  }

  .app-title {
    margin: 0;
    font-size: 54px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1px;
    color: var(--fsl-text);
  }

  .app-title span {
    color: var(--fsl-red);
  }

  .app-subtitle {
    margin: 6px 0 0;
    font-size: 19px;
    color: var(--fsl-text);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }

  .header-google-btn {
    display: flex;
    align-items: stretch;
    height: 50px;
    border: 2px solid var(--fsl-red-dark);
    border-radius: 4px;
    overflow: hidden;
    text-decoration: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    transition: filter 0.15s ease;
  }

  .header-google-btn:hover {
    filter: brightness(1.1);
  }

  .g-box {
    display: grid;
    place-items: center;
    width: 48px;
    background: #fff;
    color: var(--fsl-red-dark);
  }

  .g-label {
    display: flex;
    align-items: center;
    padding: 0 20px;
    background: var(--fsl-red-dark);
    color: #fff;
    font-size: 19px;
    font-weight: 500;
    white-space: nowrap;
  }

  .header-icon-btn {
    display: grid;
    place-items: center;
    padding: 4px;
    border: none;
    background: none;
    color: var(--fsl-red-dark);
    cursor: pointer;
    text-decoration: none;
  }

  .header-icon-btn .material-icons {
    font-size: 34px;
  }

  /* login: grafica nello stile del sito + bottone Google trasparente sopra */
  .header-login {
    position: relative;
    height: 50px;
  }

  .login-visual {
    width: 100%;
  }

  .login-visual .g-label {
    flex: 1;
    justify-content: center;
    padding: 0 12px;
  }

  .header-login:hover .login-visual {
    filter: brightness(1.1);
  }

  .login-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    opacity: 0.0001;
  }

  /* il bottone di Google è alto 40px: lo allungo a 50px per coprire tutta la grafica */
  .login-scale {
    height: 40px;
    transform: scaleY(1.25);
    transform-origin: top left;
  }

  .login-error {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 10;
    width: 260px;
    margin: 0;
    padding: 8px 10px;
    border-radius: 6px;
    background: var(--fsl-surface);
    color: #d32f2f;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 1100px) {
    .app-subtitle {
      font-size: 16px;
    }
  }

  @media (max-width: 860px) {
    .site-header {
      flex-wrap: wrap;
      gap: 12px 16px;
      padding: 14px 16px;
    }

    .brand-app {
      order: 3;
      flex-basis: 100%;
    }

    .app-title {
      font-size: 40px;
    }

    .header-actions {
      margin-left: auto;
    }
  }

  @media (max-width: 520px) {
    :global(.brand-mark) {
      width: 56px;
      height: 56px;
    }

    .brand-agnelli {
      font-size: 28px;
    }

    .g-label {
      font-size: 15px;
      padding: 0 12px;
    }

    .header-icon-btn {
      display: none;
    }
  }
</style>
