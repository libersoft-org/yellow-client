<script>
  export let img;
  export let alt;
  export let enabled = false;
</script>

<img class="indicator {enabled && 'enabled'} {enabled && 'enabled'}" src={img} {alt} />

<style>
  .indicator {
    display: none;
    position: absolute;
    top: 0px;
    right: 0px;
    width: 16px;
    height: 16px;
    padding: 5px;
    border-radius: 50%;
    animation: blink 1s infinite;
  }

  .indicator.enabled {
    display: block;
  }

  @keyframes blink {
    0% {
      opacity: 0;
    }

    30% {
      opacity: 1;
    }

    70% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }
</style>
