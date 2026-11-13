<script>
  import '../styles.css';
  import { onMount } from 'svelte';
  import { getInitialTheme, applyTheme } from '$lib/theme';

  let { children } = $props();

  onMount(() => {
    const theme = getInitialTheme();
    applyTheme(theme);
  });
</script>

{@render children()}
