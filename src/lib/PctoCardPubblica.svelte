<script>
  import AgnelliMark from './AgnelliMark.svelte';
  import { formatPeriodo } from './format.js';

  /** variante: 'rossa' | 'grigia' (alternate nella griglia, come nel mockup) */
  let { pcto, variante = 'rossa' } = $props();

  const periodo = $derived(formatPeriodo(pcto.start_date, pcto.end_date));
</script>

<article class="fsl-card" class:grigia={variante === 'grigia'}>
  <header class="fsl-card-head">
    <h3>{pcto.title}</h3>
    <AgnelliMark size={42} class="fsl-card-mark" />
  </header>

  <p class="fsl-card-desc">{pcto.description}</p>

  <dl class="fsl-card-meta">
    <div><dt>Azienda:</dt> <dd>{pcto.ente || '—'}</dd></div>
    <div><dt>Ore:</dt> <dd>{pcto.ore ?? '—'}</dd></div>
    <div><dt>Data:</dt> <dd>{periodo}</dd></div>
  </dl>
</article>

<style>
  .fsl-card {
    display: flex;
    flex-direction: column;
    padding: 22px 20px 20px;
    background: var(--fsl-surface);
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
    color: var(--fsl-text);
    --accento: var(--fsl-red-dark);
    --accento-mark: var(--fsl-red);
  }

  .fsl-card.grigia {
    --accento: var(--fsl-grey-btn);
    --accento-mark: var(--fsl-grey-btn);
  }

  .fsl-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .fsl-card-head h3 {
    margin: 0;
    font-size: 26px;
    font-weight: 500;
    line-height: 1.25;
  }

  .fsl-card-head :global(.fsl-card-mark) {
    flex-shrink: 0;
    color: var(--accento-mark);
    margin-top: -4px;
  }

  .fsl-card-desc {
    margin: 6px 0 0;
    font-size: 19px;
    line-height: 1.35;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-line;
  }

  .fsl-card-meta {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin: 18px 0 0;
    font-size: 18px;
  }

  .fsl-card-meta div {
    display: flex;
    gap: 5px;
  }

  .fsl-card-meta dt,
  .fsl-card-meta dd {
    margin: 0;
  }

  @media (max-width: 520px) {
    .fsl-card-head h3 {
      font-size: 20px;
    }

    .fsl-card-desc,
    .fsl-card-meta {
      font-size: 16px;
    }
  }
</style>
