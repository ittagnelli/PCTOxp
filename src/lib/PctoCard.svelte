<script>
  import { formatDate } from './format.js';

  let {
    pcto,
    mode = 'public',
    iscritto = false,
    studenti = [],
    currentUserId = null,
    hasMaxEnrollments = false,
    onSubscribe,
    onUnsubscribe,
    onDelete
  } = $props();

  const isOwner = $derived(
    mode === 'docente' && (!pcto.created_by || pcto.created_by === currentUserId)
  );

  const docenteReferente = $derived(
    pcto.docente_nome || pcto.docente_email || 'Docente Istituto Agnelli'
  );

  const timeDisplay = $derived(
    pcto.start_time && pcto.end_time
      ? `${pcto.start_time} - ${pcto.end_time}`
      : pcto.start_time || pcto.end_time || '08:30 - 12:30'
  );

  const maxPosti = $derived(pcto.max_studenti || 20);
  const numIscritti = $derived(
    pcto.num_iscritti !== undefined
      ? Number(pcto.num_iscritti)
      : (studenti?.length ?? 0)
  );
  const isFull = $derived(numIscritti >= maxPosti);
</script>

<div class="pcto-item">
  <span class="pcto-title">{pcto.title}</span>
  <span class="pcto-desc">{pcto.description}</span>

  <div class="pcto-meta">
    {#if pcto.ente}
      <span class="meta-entry">
        <span class="material-icons meta-icon">business</span>
        Azienda/Ente: <strong>{pcto.ente}</strong>
      </span>
    {/if}

    {#if pcto.luogo}
      <span class="meta-entry">
        <span class="material-icons meta-icon">place</span>
        Luogo: <strong>{pcto.luogo}</strong>
      </span>
    {/if}

    <span class="meta-entry">
      <span class="material-icons meta-icon">person</span>
      Docente: <strong>{docenteReferente}</strong>
    </span>

    <span class="meta-entry posti-entry" class:is-full={isFull && !iscritto}>
      <span class="material-icons meta-icon">groups</span>
      Posti: <strong>{numIscritti} / {maxPosti}</strong>
      {#if isFull && !iscritto}
        <span class="badge-esaurito">Esaurito</span>
      {/if}
    </span>
  </div>

  <span class="pcto-start">{formatDate(pcto.start_date)}</span>
  <span class="pcto-end">{formatDate(pcto.end_date)}</span>

  <span class="pcto-time" title="Orario del PCTO">
    <span class="material-icons time-icon" style="font-size: 16px;">schedule</span>
    {timeDisplay}
  </span>

  {#if mode === 'studente'}
    <div class="button-container">
      <button
        class:iscritto
        class="iscriviti"
        class:disabled-btn={!iscritto && (isFull || hasMaxEnrollments)}
        disabled={iscritto || (!iscritto && isFull)}
        onclick={() => onSubscribe?.(pcto.id)}
      >
        {#if iscritto}
          Iscritto
        {:else if isFull}
          Posti esauriti
        {:else if hasMaxEnrollments}
          Max 5 raggiunto
        {:else}
          Iscriviti
        {/if}
      </button>
      <button
        class:show={iscritto}
        class="unsubscribe-btn"
        title="Disiscriviti"
        onclick={() => onUnsubscribe?.(pcto.id)}
      >
        ✕
      </button>
    </div>
  {/if}

  {#if mode === 'docente'}
    <div class="studenti-iscritti">
      {#if isOwner}
        {#if studenti && studenti.length > 0}
          <strong>Studenti iscritti ({studenti.length} / {maxPosti}):</strong>
          <ul>
            {#each studenti as studente}
              <li>{studente}</li>
            {/each}
          </ul>
        {:else}
          <em>Nessuno studente iscritto a questo PCTO (0 / {maxPosti})</em>
        {/if}
      {:else}
        <em class="not-owner-msg">
          <span class="material-icons" style="font-size: 15px; vertical-align: middle;">lock</span>
          Iscritti e gestione riservati al docente creatore ({docenteReferente})
        </em>
      {/if}
    </div>

    {#if isOwner}
      <span class="pctobtn-del">
        <button class="delPCTO" onclick={() => onDelete?.(pcto.id)}>Elimina PCTO</button>
      </span>
    {/if}
  {/if}
</div>

<style>
  .pcto-meta {
    grid-area: docente;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;
  }
  .meta-entry {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.88em;
    color: var(--muted-text, #555);
  }
  .meta-icon {
    font-size: 16px;
    color: #1976d2;
  }
  .badge-esaurito {
    background: #d32f2f;
    color: #ffffff;
    font-size: 11px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 6px;
    text-transform: uppercase;
  }
  .disabled-btn {
    opacity: 0.65;
    cursor: not-allowed;
  }
  .not-owner-msg {
    color: var(--muted-text, #777);
    font-size: 0.85em;
  }
</style>
