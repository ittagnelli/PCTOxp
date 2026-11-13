<script>
  import { toInputDate } from './format.js';
  import { onMount } from 'svelte';

  let {
    startDate = $bindable(null),
    endDate = $bindable(null),
    startTime = $bindable('08:30'),
    endTime = $bindable('12:30'),
    numMonths = 13
  } = $props();

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

      for (let empty = 0; empty < (firstDay + 6) % 7; empty += 1) {
        days.push({ key: `${index}-empty-${empty}`, label: '' });
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const fullDate = new Date(date.getFullYear(), date.getMonth(), day);
        days.push({ key: toInputDate(fullDate), label: String(day), date: fullDate });
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
    if (!day.date) return 'day empty';
    const value = toInputDate(day.date);
    const classes = ['day'];

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

<section class="calendar-container">
  <div class="calendar-header">
    <div class="selected-times">
      <div class="time-input-group">
        <label for="start-time-input">Ora inizio:</label>
        <input id="start-time-input" type="time" bind:value={startTime} required />
      </div>
      <div class="time-input-group">
        <label for="end-time-input">Ora fine:</label>
        <input id="end-time-input" type="time" bind:value={endTime} required />
      </div>
    </div>
    <div class="selected-dates">
      <input type="text" readonly placeholder="Data inizio" value={startDate ?? ''} />
      <input type="text" readonly placeholder="Data fine" value={endDate ?? ''} />
    </div>


    <div class="weekdays">
      <div>M</div>
      <div>T</div>
      <div>W</div>
      <div>T</div>
      <div>F</div>
      <div>S</div>
      <div>S</div>
    </div>
  </div>

  {#each months as month}
    <div class="month">
      <div class="month-title">{month.title}</div>
      <div class="days-grid">
        {#each month.days as day (day.key)}
          <button type="button" class={dayClass(day)} onclick={() => selectDate(day)}>
            {day.label}
          </button>
        {/each}
      </div>
    </div>
  {/each}
</section>

<style>
  .selected-times {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .time-input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .time-input-group label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-color, #444);
  }

  .time-input-group input[type='time'] {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 8px;
    font-weight: bold;
    text-align: center;
    background: var(--card-bg, #fff);
    color: var(--text-color, #111);
    box-sizing: border-box;
  }
</style>
