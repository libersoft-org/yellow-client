<script>
  import { lightenColor } from '@/core/utils/colorUtils.ts';
  export let color = '#666';
  export let moving = false;
  export let value = 0;
</script>

<div class="progress-bar">
  <div class="fill {moving ? 'moving' : ''}" style="width: {value}%;"></div>
</div>

<style>
  .progress-bar {
    width: calc(100% - 6px);
    height: 10px;
    border: 3px solid #000;
    background: #eee;
    overflow: hidden;
    position: relative;
    border-radius: 10px;
  }

  .fill {
    height: 100%;
    background: linear-gradient(
      -45deg,
      var(--color-primary-background) 25%,
      var(--color-primary-softer-background) 25%,
      var(--color-primary-softer-background) 50%,
      var(--color-primary-background) 50%,
      var(--color-primary-background) 75%,
      var(--color-primary-softer-background) 75%,
      var(--color-softer-background) 100%
    );
    background-size: 40px 40px;
    width: 0%;
    transition: width 0.3s ease;
  }

  .moving {
    animation: moveStripes 1s linear infinite;
  }

  @keyframes moveStripes {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 40px 0;
    }
  }
</style>
