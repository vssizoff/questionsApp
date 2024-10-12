<script lang="ts">
import {defineComponent} from 'vue'
import Button from "primevue/button";

export default defineComponent({
  name: "AdminView",
  components: {Button}
})
</script>

<template>
  <header>
    <Button>Очередь</Button>
    <Button>Ожидают проверки</Button>
    <Button>Отклонено</Button>
  </header>
  <RouterView/>
</template>

<style scoped>
header {
  display: flex;
  gap: 20px;
  justify-content: center;
}
</style>