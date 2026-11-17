<script>
  import { onMount } from 'svelte';
  import AgnelliMark from './AgnelliMark.svelte';
  import { fallbackImage, logout } from './auth.js';
  import { applyTheme, getInitialTheme } from './theme.js';

  /**
   * Struttura delle bacheche (header + menu laterale + contenuto).
   * nav: [{ key, label, icon, href, accent? }]
   */
  let {
    profile = null,
    title = '',
    subtitle = '',
    area = '',
    nav = [],
    active = $bindable(''),
    children
  } = $props();

  let theme = $state('light');

  onMount(() => {
    theme = getInitialTheme();
  });

  const displayName = $derived(
    profile ? `${profile.nome} ${profile.cognome}`.trim() || profile.email : ''
  );
  const ruoloLabel = $derived(profile?.ruolo === 'docente' ? 'Docente' : 'Studente');

  const avatarSrc = $derived(
    profile?.img_profilo?.trim() ||
      (profile?.nome
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nome + '+' + (profile.cognome || ''))}&background=7a1622&color=fff&size=120&bold=true`
        : fallbackImage)
  );

  function handleImageError(event) {
    const img = event.currentTarget;
    if (!img.src.endsWith(fallbackImage)) img.src = fallbackImage;
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
  }

  async function handleLogout() {
    await logout();
    window.location.href = '/bacheca';
  }
</script>

<div class="fsl-app">
  <header class="fsl-head">
    <a class="brand-istituto" href="/bacheca" aria-label="Istituto Agnelli - Home">
      <AgnelliMark size={64} class="brand-mark" />
      <span class="brand-testo">
        <span class="brand-agnelli">Agnelli</span>
        <span class="brand-salesiani"><b>SALESIANI</b>DONBOSCO</span>
        <span class="brand-torino">TORINO</span>
      </span>
    </a>

    <div class="brand-app">
      <p class="app-title">FSL<span>xp</span></p>
      <p class="app-subtitle">{subtitle || title}</p>
    </div>

    <div class="page-title">
      <h1>{title}</h1>
      <p>{area}</p>
    </div>

    {#if profile}
      <div class="user-block">
        <div class="user-text">
          <strong>{displayName}</strong>
          <span>({ruoloLabel})</span>
        </div>
        <img
          class="user-avatar"
          src={avatarSrc}
          alt={`Foto di ${displayName}`}
          referrerpolicy="no-referrer"
          onerror={handleImageError}
        />
        {#if nav.length === 0}
          <button
            class="logout-icon theme-icon"
            type="button"
            onclick={toggleTheme}
            title={theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
            aria-label="Cambia tema"
          >
            <span class="material-icons">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>
        {/if}
        <button class="logout-icon" type="button" onclick={handleLogout} title="Esci" aria-label="Esci">
          <span class="material-icons">logout</span>
        </button>
      </div>
    {/if}
  </header>

  <div class="fsl-body" class:no-side={nav.length === 0}>
    {#if nav.length > 0}
      <nav class="fsl-side" aria-label="Navigazione">
        {#each nav as item (item.key)}
          <a
            class="side-link"
            class:active={active === item.key}
            class:accent={item.accent}
            href={item.href}
            onclick={() => (active = item.key)}
          >
            <span class="material-icons">{item.icon}</span>
            {item.label}
          </a>
        {/each}

        <button class="side-link side-theme" type="button" onclick={toggleTheme}>
          <span class="material-icons">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          {theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
        </button>
      </nav>
    {/if}

    <main class="fsl-main">
      {@render children?.()}
    </main>
  </div>
</div>

<style>
  .fsl-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--fsl-page-bg);
    color: var(--fsl-text);
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ------------------------------------------------------------ header */
  .fsl-head {
    display: flex;
    align-items: center;
    gap: 28px;
    padding: 14px 32px 14px 28px;
    background: var(--fsl-surface);
    border-bottom: 1px solid var(--border-color);
  }

  .brand-istituto {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    text-decoration: none;
    color: var(--fsl-red);
  }

  .brand-testo {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .brand-agnelli {
    padding-bottom: 3px;
    border-bottom: 2px solid var(--fsl-brand-grey);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--fsl-brand-grey);
  }

  .brand-salesiani {
    margin-top: 4px;
    font-size: 9.5px;
    letter-spacing: 0.1px;
    color: var(--fsl-brand-grey);
  }

  .brand-torino {
    margin-top: 3px;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 5px;
    color: var(--fsl-red);
  }

  .brand-app {
    flex-shrink: 0;
  }

  .app-title {
    margin: 0;
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1px;
  }

  .app-title span {
    color: var(--fsl-red);
  }

  .app-subtitle {
    margin: 4px 0 0;
    font-size: 17px;
  }

  .page-title {
    min-width: 0;
  }

  .page-title h1 {
    margin: 0;
    font-size: 38px;
    font-weight: 700;
    line-height: 1.1;
  }

  .page-title p {
    margin: 6px 0 0;
    font-size: 19px;
  }

  .user-block {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-left: auto;
    flex-shrink: 0;
  }

  .user-text {
    display: flex;
    flex-direction: column;
    text-align: right;
    font-size: 20px;
    line-height: 1.25;
  }

  .user-text strong {
    font-weight: 700;
  }

  .user-text span {
    font-weight: 500;
  }

  .user-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-color);
  }

  .logout-icon {
    display: grid;
    place-items: center;
    padding: 4px;
    border: none;
    background: none;
    color: var(--fsl-red);
    cursor: pointer;
  }

  .logout-icon .material-icons {
    font-size: 34px;
  }

  /* ------------------------------------------------------------ corpo */
  .fsl-body {
    flex: 1;
    display: grid;
    grid-template-columns: 270px minmax(0, 1fr);
  }

  /* senza menu laterale il contenuto occupa tutta la larghezza */
  .fsl-body.no-side {
    grid-template-columns: minmax(0, 1fr);
  }

  .no-side .fsl-main {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
  }

  .theme-icon {
    color: var(--fsl-muted);
  }

  .fsl-side {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    background: var(--fsl-surface);
    border-right: 1px solid var(--border-color);
  }

  .side-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--fsl-text);
    font-size: 19px;
    font-weight: 500;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s ease, filter 0.15s ease;
  }

  .side-link .material-icons {
    font-size: 26px;
  }

  .side-link:hover {
    background: var(--btn-hover-bg);
  }

  .side-link.accent {
    color: var(--fsl-red);
  }

  .side-link.active {
    background: var(--fsl-red-dark);
    color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }

  .side-link.active:hover {
    background: var(--fsl-red-dark);
    filter: brightness(1.12);
  }

  .side-theme {
    margin-top: auto;
    color: var(--fsl-muted);
  }

  .fsl-main {
    min-width: 0;
    padding: 32px 36px 48px;
  }

  /* ------------------------------------------------------------ elementi condivisi dalle pagine */
  .fsl-app :global(.fsl-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    border: none;
    border-radius: 5px;
    background: var(--fsl-red-dark);
    color: #fff;
    font-size: 17px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: filter 0.15s ease;
  }

  .fsl-app :global(.fsl-btn:hover:not(:disabled)) {
    filter: brightness(1.15);
  }

  .fsl-app :global(.fsl-btn:disabled) {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  .fsl-app :global(.fsl-btn.light) {
    background: var(--btn-hover-bg);
    color: var(--fsl-text);
    border: 1px solid var(--border-color);
    box-shadow: none;
  }

  .fsl-app :global(.fsl-btn .material-icons) {
    font-size: 20px;
  }

  .fsl-app :global(.fsl-badge) {
    display: inline-block;
    padding: 5px 16px;
    border-radius: 999px;
    background: rgba(46, 125, 50, 0.18);
    color: #2e7d32;
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
  }

  .fsl-app :global(.fsl-badge.muted) {
    background: rgba(128, 128, 128, 0.2);
    color: var(--fsl-muted);
  }

  /* ------------------------------------------------------------ schermi piccoli */
  @media (max-width: 1100px) {
    .page-title {
      display: none;
    }
  }

  @media (max-width: 900px) {
    .fsl-head {
      gap: 14px;
      padding: 12px 16px;
    }

    .app-title {
      font-size: 38px;
    }

    .fsl-body {
      grid-template-columns: minmax(0, 1fr);
    }

    .fsl-side {
      flex-direction: row;
      flex-wrap: wrap;
      padding: 10px 12px;
      border-right: none;
      border-bottom: 1px solid var(--border-color);
    }

    .side-link {
      padding: 10px 12px;
      font-size: 16px;
    }

    .side-link .material-icons {
      font-size: 22px;
    }

    .side-theme {
      margin-top: 0;
      margin-left: auto;
    }

    .fsl-main {
      padding: 24px 16px 40px;
    }
  }

  @media (max-width: 560px) {
    .app-subtitle,
    .user-text {
      display: none;
    }

    .brand-agnelli {
      font-size: 26px;
    }
  }
</style>
