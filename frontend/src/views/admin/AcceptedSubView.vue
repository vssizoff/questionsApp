<script lang="ts">
import {defineComponent} from 'vue'
import type {MessageType, TextType} from "@/api/index.js";
import {getQueue} from "@/api/queue.js";
import QueueQuestion from "@/views/admin/QueueQuestion.vue";

export default defineComponent({
  name: "AcceptedSubView",
  components: {QueueQuestion},
  data() {
    return {
      queue: [] as Array<MessageType & {text: TextType}>
    }
  },
  async mounted() {
    this.queue = await getQueue();
  }
})
</script>

<template>
  <div class="root">
    <main>
      <QueueQuestion v-for="question in queue" :question="question"/>
    </main>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  align-items: center;
  flex-direction: column;

  main {
    max-width: 1000px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}
</style>