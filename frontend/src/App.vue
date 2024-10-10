<script lang="ts">
import {RouterView} from 'vue-router'
import {defineComponent} from "vue";
import Toast from "primevue/toast";

export default defineComponent({
  components: {RouterView, Toast}
});
</script>

<template>
  <Toast/>
  <RouterView />
</template>

<style scoped>

</style>
