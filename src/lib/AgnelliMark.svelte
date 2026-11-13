<script>
  /**
   * Marchio dell'Istituto (cerchio con tre figure a braccia alzate).
   * SEGNAPOSTO disegnato a mano: sostituire i path con quelli del logo ufficiale.
   * Il colore del cerchio segue `color` (currentColor), le figure sono bianche.
   */
  let { size = 40, title = 'Istituto Agnelli', class: className = '' } = $props();
</script>

<svg
  class={className}
  width={size}
  height={size}
  viewBox="0 0 100 100"
  role="img"
  aria-label={title}
>
  <circle cx="50" cy="50" r="50" fill="currentColor" />
  <g fill="#fff">
    <circle cx="50" cy="27" r="7.5" />
    <circle cx="25" cy="38" r="6.5" />
    <circle cx="75" cy="38" r="6.5" />
  </g>
  <g stroke="#fff" stroke-linecap="round" fill="none">
    <!-- figura centrale: braccia alzate a V -->
    <path d="M50 41 V80" stroke-width="11" />
    <path d="M45 46 L37 22 M55 46 L63 22" stroke-width="6" />
    <!-- figure laterali: un braccio alzato verso l'esterno -->
    <path d="M25 50 V78 M75 50 V78" stroke-width="9" />
    <path d="M22 54 L11 33 M78 54 L89 33" stroke-width="5.5" />
  </g>
</svg>
