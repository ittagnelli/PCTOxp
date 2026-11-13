<script>
  import { fallbackImage, logout } from './auth.js';
  import { applyTheme, getInitialTheme } from './theme.js';
  import { onMount } from 'svelte';

  let {
    profile = null,
    showTeacherLinks = false,
    showLogin = false
  } = $props();

  let showSettings = $state(false);
  let currentTheme = $state('light');
  let isDrawerOpen = $state(false);

  onMount(() => {
    currentTheme = getInitialTheme();
  });

  const displayName = $derived(
    profile ? `${profile.nome} ${profile.cognome}`.trim() || profile.email : 'Non loggato'
  );

  const avatarSrc = $derived(
    profile?.img_profilo?.trim() ||
      (profile?.nome
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nome + '+' + (profile.cognome || ''))}&background=1976d2&color=fff&size=120&bold=true`
        : fallbackImage)
  );

  async function handleLogout() {
    await logout();
    window.location.href = '/bacheca';
  }

  function handleImageError(event) {
    const img = event.currentTarget;
    if (img.src !== fallbackImage) {
      img.src = fallbackImage;
    }
  }

  function handleThemeChange(theme) {
    currentTheme = theme;
    applyTheme(theme);
  }

  function closeDrawer() {
    isDrawerOpen = false;
  }
</script>

<button
  class="mobile-menu-trigger"
  onclick={() => (isDrawerOpen = true)}
  aria-label="Apri menu di navigazione"
  title="Menu"
>
  <span class="material-icons">menu</span>
</button>

{#if isDrawerOpen}
  <div
    class="drawer-backdrop"
    onclick={closeDrawer}
    onkeydown={(e) => e.key === 'Escape' && closeDrawer()}
    role="button"
    tabindex="0"
    aria-label="Chiudi menu"
  ></div>
{/if}

<nav class="navbar" class:drawer-open={isDrawerOpen}>
  
  <button class="drawer-close-btn" onclick={closeDrawer} aria-label="Chiudi menu">
    <span class="material-icons">close</span>
  </button>

  
  <div class="nav-profile-block">
    <img
      id="img-profilo"
      src={avatarSrc}
      alt={`Foto di ${displayName}`}
      referrerpolicy="no-referrer"
      onerror={handleImageError}
    />
    <h3 id="h3">{displayName}</h3>
  </div>

  
  {#if showTeacherLinks}
    <div class="nav-links">
      <a class="nav-element" href="/bacheca/docente" onclick={closeDrawer}>
        <span class="material-icons icon">view_timeline</span>
        <span class="text">Bacheca</span>
      </a>
      <a class="nav-element" href="/aggiunta-pcto" onclick={closeDrawer}>
        <span class="material-icons icon">add</span>
        <span class="text">Aggiungi PCTO</span>
      </a>
    </div>
  {/if}

  
  <div class="navbar-bottom">
    <button
      class="settings-btn"
      onclick={() => {
        closeDrawer();
        showSettings = true;
      }}
      title="Impostazioni Tema"
      aria-label="Impostazioni"
    >
      <span class="material-icons">settings</span>
    </button>

    {#if showLogin}
      <a href="/login" class="login-btn" onclick={closeDrawer}>
        <span class="material-icons">login</span>
        Login
      </a>
    {:else}
      <button class="logout-btn" onclick={handleLogout}>
        <span class="material-icons">logout</span>
        Logout
      </button>
    {/if}
  </div>
</nav>

{#if showSettings}
  <div
    class="settings-modal-backdrop"
    onclick={() => (showSettings = false)}
    onkeydown={(e) => e.key === 'Escape' && (showSettings = false)}
    role="button"
    tabindex="0"
  >
    <div
      class="settings-modal"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="settings-modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="material-icons" style="color: #1976d2;">settings</span>
          <h3 style="margin: 0; font-size: 20px;">Impostazioni</h3>
        </div>
        <button class="settings-close-btn" onclick={() => (showSettings = false)}>✕</button>
      </div>

      <div class="settings-modal-body">
        <p class="settings-section-title">Tema applicazione</p>
        <div class="theme-options">
          <button
            type="button"
            class="theme-card"
            class:selected={currentTheme === 'light'}
            onclick={() => handleThemeChange('light')}
          >
            <span class="material-icons theme-icon">light_mode</span>
            <span class="theme-name">Tema Chiaro</span>
            {#if currentTheme === 'light'}
              <span class="material-icons check-icon">check_circle</span>
            {/if}
          </button>

          <button
            type="button"
            class="theme-card"
            class:selected={currentTheme === 'dark'}
            onclick={() => handleThemeChange('dark')}
          >
            <span class="material-icons theme-icon">dark_mode</span>
            <span class="theme-name">Tema Scuro</span>
            {#if currentTheme === 'dark'}
              <span class="material-icons check-icon">check_circle</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  
  .mobile-menu-trigger {
    display: none;
    position: fixed;
    top: 14px;
    left: 14px;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: var(--card-bg, #ffffff);
    color: var(--text-color, #111111);
    border: 1px solid var(--border-color, #cccccc);
    box-shadow: 0 2px 10px var(--shadow, rgba(0, 0, 0, 0.1));
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 900;
    transition: background-color 0.2s, transform 0.1s;
  }

  .mobile-menu-trigger:hover {
    background: var(--btn-hover-bg, #f0f0f0);
  }

  
  .drawer-close-btn {
    display: none;
    align-self: flex-end;
    background: transparent;
    border: none;
    color: var(--text-color, #111111);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    margin-bottom: 10px;
  }

  .drawer-close-btn .material-icons {
    font-size: 26px;
  }

  
  .drawer-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 1999;
  }

  .navbar-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 20px;
    width: 100%;
  }

  .settings-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background-color: var(--btn-bg, transparent);
    color: var(--text-color, #000);
    border: 1px solid var(--border-color, #ccc);
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    flex-shrink: 0;
  }

  .settings-btn .material-icons{
    transition: all .2s ease-in;
  }
  .settings-btn:hover .material-icons{
    transform: rotate(30deg);
  }

  .navbar-bottom .login-btn,
  .navbar-bottom .logout-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 44px;
    padding: 0 14px;
    box-sizing: border-box;
    margin: 0;
    text-decoration: none;
    font-weight: bold;
  }

  
  .settings-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .settings-modal {
    background: var(--card-bg, #ffffff);
    color: var(--text-color, #111111);
    border-radius: 12px;
    width: min(420px, 92vw);
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color, #e0e0e0);
  }

  .settings-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color, #eee);
    padding-bottom: 12px;
    margin-bottom: 18px;
  }

  .settings-close-btn {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-color, #666);
    padding: 4px 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
  }

  .settings-close-btn:hover {
    background: var(--btn-hover-bg, #f0f0f0);
  }

  .settings-section-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--muted-text, #666);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .theme-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 12px;
    border: 2px solid var(--border-color, #ddd);
    border-radius: 10px;
    background: var(--btn-bg, #fafafa);
    color: var(--text-color, #222);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .theme-card:hover {
    border-color: #1976d2;
    transform: translateY(-2px);
  }

  .theme-card.selected {
    border-color: #1976d2;
    font-weight: bold;
  }

  .theme-icon {
    font-size: 32px;
    color: #1976d2;
  }

  .theme-name {
    font-size: 14px;
  }

  .check-icon {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 18px;
    color: #1976d2;
  }

  
  @media screen and (max-width: 1024px) {
    .mobile-menu-trigger {
      display: inline-flex;
    }

    .drawer-close-btn {
      display: inline-flex;
    }

    :global(.navbar) {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 270px !important;
      height: 100dvh !important;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2000 !important;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3) !important;
      display: flex !important;
      flex-direction: column !important;
      border-radius: 0 16px 16px 0 !important;
    }

    :global(.navbar.drawer-open) {
      transform: translateX(0) !important;
    }
  }
</style>
