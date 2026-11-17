<script>
  import { getProfile, SiteHeader, PctoCardPubblica } from '$lib';
  import { toInputDate } from '$lib/format.js';
  import { onMount } from 'svelte';

  let profile = $state(null);
  let pcto = $state([]);
  let loading = $state(true);
  let errorMessage = $state('');

  // Nella home si mostrano solo i percorsi non ancora conclusi.
  const disponibili = $derived(pcto.filter((p) => p.end_date >= toInputDate(new Date())));

  async function loadBacheca() {
    loading = true;
    errorMessage = '';

    try {
      const [userProfile, res] = await Promise.all([getProfile(), fetch('/api/pcto')]);
      profile = userProfile;
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
  <title>FSLxp</title>
</svelte:head>

<div class="fsl-page">
  <SiteHeader {profile} />

  <section class="hero">
    <div class="hero-card">
      <img class="hero-img hero-img-sx" src="/assets/home/hero-sinistra.svg" alt="" />

      <div class="hero-body">
        <h2>Benvenuto su FSLxp</h2>
        <p>
          Esplora i percorsi di PCTO disponibili per l'Istituto Agnelli.<br />
          {#if profile}
            Vai alla tua bacheca per gestire le tue attività.
          {:else}
            Accedi per candidarti e gestire le tue attività.
          {/if}
        </p>
      </div>

      <img class="hero-img hero-img-dx" src="/assets/home/hero-destra.svg" alt="" />
    </div>
  </section>

  <main class="percorsi" id="percorsi">
    <h2>I percorsi PCTO Disponibili</h2>

    {#if loading}
      <p class="stato">Caricamento...</p>
    {:else if errorMessage}
      <p class="stato">{errorMessage}</p>
    {:else if disponibili.length === 0}
      <p class="stato">Nessun PCTO disponibile al momento.</p>
    {:else}
      <div class="griglia">
        {#each disponibili as item, i (item.id)}
          <PctoCardPubblica pcto={item} variante={i % 2 === 0 ? 'rossa' : 'grigia'} />
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  .fsl-page {
    min-height: 100vh;
    background: var(--fsl-page-bg);
    color: var(--fsl-text);
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* fascia rossa dietro la card di benvenuto */
  .hero {
    position: relative;
    padding: 46px 24px 0;
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 190px;
    background:
      linear-gradient(115deg, transparent 0 62%, rgba(255, 255, 255, 0.06) 62% 75%, transparent 75%),
      linear-gradient(70deg, rgba(255, 255, 255, 0.05) 0 18%, transparent 18%),
      linear-gradient(90deg, #4f3a3c 0%, #7e2229 40%, #b0161e 70%, #b3151d 100%);
  }

  .hero-card {
    position: relative;
    display: flex;
    align-items: stretch;
    max-width: 1100px;
    min-height: 266px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 14px;
    background: linear-gradient(90deg, #5d4446 0%, #872028 38%, #a3161e 70%, #a8151d 100%);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    color: #fff;
  }

  .hero-img {
    align-self: flex-end;
    width: 290px;
    flex-shrink: 0;
    display: block;
  }

  .hero-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px 12px;
    text-align: center;
  }

  .hero-body h2 {
    margin: 0;
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .hero-body p {
    margin: 12px 0 0;
    font-size: 19px;
    line-height: 1.5;
  }

  .percorsi {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 24px 48px;
    box-sizing: content-box;
    scroll-margin-top: 16px;
  }

  .percorsi h2 {
    margin: 0 0 20px;
    font-size: 27px;
    font-weight: 500;
  }

  .griglia {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .stato {
    color: var(--fsl-muted);
    font-size: 18px;
  }

  @media (max-width: 1000px) {
    .hero-img-dx {
      display: none;
    }
  }

  @media (max-width: 760px) {
    .hero {
      padding: 20px 16px 0;
    }

    .hero-img {
      display: none;
    }

    .hero-body h2 {
      font-size: 30px;
    }

    .hero-body p {
      font-size: 16px;
    }

    .percorsi {
      padding: 28px 16px 40px;
    }

    .percorsi h2 {
      font-size: 22px;
    }

    .griglia {
      grid-template-columns: 1fr;
    }
  }
</style>
