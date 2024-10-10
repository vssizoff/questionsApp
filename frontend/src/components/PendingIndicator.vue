<script lang="ts">
import {defineComponent} from "vue";
import {VueSpinnerGrid} from "vue3-spinners";

export default defineComponent({
  name: "PendingIndicator",
  components: {VueSpinnerGrid}
})
</script>

<template>
  <VueSpinnerGrid :size="64"/>
</template>

<style scoped>
svg {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>