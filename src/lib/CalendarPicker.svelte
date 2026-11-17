<script>
  import { formatDate, toInputDate } from './format.js';
  import { onMount } from 'svelte';

  let {
    startDate = $bindable(null),
    endDate = $bindable(null),
    startTime = $bindable('08:30'),
    endTime = $bindable('12:30'),
    numMonths = 13
  } = $props();

  const GIORNI = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  let months = $state([]);

  function buildMonths() {
    const today = new Date();
    const output = [];

    for (let index = 0; index < numMonths; index += 1) {
      const date = new Date(today.getFullYear(), today.getMonth() + index, 1);
      const monthTitle = date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
      const firstDay = date.getDay();
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const days = [];

      // la settimana parte da lunedì
      for (let empty = 0; empty < (firstDay + 6) % 7; empty += 1) {
        days.push({ key: `${index}-empty-${empty}`, label: '' });
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const fullDate = new Date(date.getFullYear(), date.getMonth(), day);
        const weekDay = fullDate.getDay();
        days.push({
          key: toInputDate(fullDate),
          label: String(day),
          date: fullDate,
          weekend: weekDay === 0 || weekDay === 6
        });
      }

      output.push({ title: monthTitle, days });
    }

    months = output;
  }

  function selectDate(day) {
    if (!day.date) return;
    const selected = toInputDate(day.date);

    if (!startDate || (startDate && endDate) || selected < startDate) {
      startDate = selected;
      endDate = null;
      return;
    }

    endDate = selected;
  }

  function dayClass(day) {
    const value = toInputDate(day.date);
    const classes = ['cal-day'];

    if (day.weekend) classes.push('weekend');
    if (value === startDate || value === endDate) classes.push('selected');
    if (value === startDate) classes.push('first-in-range');
    if (value === endDate) classes.push('last-in-range');
    if (startDate && endDate && value > startDate && value < endDate) {
      classes.push('in-range');
    }

    return classes.join(' ');
  }

  onMount(() => {
    buildMonths();
  });
</script>

<section class="cal">
  <div class="cal-top">
    <div class="cal-times">
      <div class="cal-field">
        <label for="start-time-input">Ora inizio:</label>
        <input id="start-time-input" type="time" bind:value={startTime} required />
      </div>
      <div class="cal-field">
        <label for="end-time-input">Ora fine:</label>
        <input id="end-time-input" type="time" bind:value={endTime} required />
      </div>
    </div>

    <div class="cal-dates">
      <input
        type="text"
        readonly
        placeholder="Data inizio"
        aria-label="Data inizio"
        value={startDate ? formatDate(startDate) : ''}
      />
      <input
        type="text"
        readonly
        placeholder="Data fine"
        aria-label="Data fine"
        value={endDate ? formatDate(endDate) : ''}
      />
    </div>

    <div class="cal-weekdays">
      {#each GIORNI as giorno, i}
        <div class:weekend={i >= 5}>{giorno}</div>
      {/each}
    </div>
  </div>

  <div class="cal-months">
    {#each months as month}
      <div class="cal-month">
        <div class="cal-month-title">{month.title}</div>
        <div class="cal-grid">
          {#each month.days as day (day.key)}
            {#if day.date}
              <button type="button" class={dayClass(day)} onclick={() => selectDate(day)}>
                {day.label}
              </button>
            {:else}
              <span class="cal-day empty"></span>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .cal {
    display: flex;
    flex-direction: column;
    height: max(480px, calc(100vh - 170px));
    min-height: 0;
    color: var(--fsl-text);
  }

  .cal-top {
    flex: none;
  }

  .cal-times {
    display: flex;
    gap: 16px;
    margin-bottom: 14px;
  }

  .cal-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .cal-field label {
    font-size: 18px;
  }

  .cal-field input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--fsl-text);
    font-size: 20px;
    text-align: center;
  }

  .cal-dates {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }

  .cal-dates input {
    flex: 1;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: rgba(128, 128, 128, 0.14);
    color: var(--fsl-text);
    font-size: 20px;
    text-align: center;
  }

  .cal-dates input::placeholder {
    color: var(--fsl-muted);
  }

  .cal-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border-color);
    font-size: 20px;
    font-weight: 700;
    text-align: center;
  }

  .cal-weekdays .weekend {
    color: var(--fsl-red);
  }

  .cal-months {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-top: 12px;
  }

  .cal-month {
    margin-bottom: 18px;
  }

  .cal-month-title {
    position: relative;
    top: 1px;
    width: fit-content;
    padding: 8px 14px;
    border: 1px solid var(--border-color);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    background: var(--fsl-surface);
    font-size: 20px;
    font-weight: 700;
  }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 6px 0;
    border: 1px solid var(--border-color);
    border-radius: 0 8px 8px 8px;
    background: var(--fsl-surface);
  }

  .cal-day {
    padding: 10px 2px;
    border: none;
    background: none;
    color: var(--fsl-text);
    font-size: 19px;
    text-align: center;
    cursor: pointer;
  }

  .cal-day.empty {
    cursor: default;
  }

  .cal-day.weekend {
    color: var(--fsl-red);
  }

  .cal-day:not(.empty):hover {
    background: var(--btn-hover-bg);
  }

  .cal-day.in-range {
    background: rgba(163, 18, 31, 0.15);
  }

  .cal-day.selected,
  .cal-day.selected:hover {
    background: var(--fsl-red-dark);
    color: #fff;
  }

  .cal-day.first-in-range {
    border-radius: 8px 0 0 8px;
  }

  .cal-day.last-in-range {
    border-radius: 0 8px 8px 0;
  }

  .cal-day.first-in-range.last-in-range {
    border-radius: 8px;
  }

  @media (max-width: 1000px) {
    .cal {
      height: auto;
    }

    .cal-months {
      flex: none;
      max-height: 60vh;
    }
  }
</style>
