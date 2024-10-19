<script lang="ts">
import {defineComponent} from 'vue'
import type {MessageType, TextType} from "@/api/index.js";
import {getQueue, patchQueue, popQueue} from "@/api/queue.js";
import QueueQuestion from "@/views/admin/QueueQuestion.vue";
import Button from "primevue/button";

export default defineComponent({
  name: "AcceptedSubView",
  components: {QueueQuestion, Button},
  data() {
    return {
      queue: [] as Array<MessageType & {text: TextType, used: boolean}>
    }
  },
  async mounted() {
    this.queue = await getQueue();
  },
  methods: {
    commit() {
      patchQueue(this.queue.map(({text: {id}, used}) => ([id, used])));
    },
    moveUp(index: number) {
      if (index <= 0) return;
      let tmp = this.queue[index];
      this.queue[index] = this.queue[index - 1];
      this.queue[index - 1] = tmp;
      this.commit();
    },
    moveDown(index: number) {
      if (index >= this.queue.length - 1) return;
      let tmp = this.queue[index];
      this.queue[index] = this.queue[index + 1];
      this.queue[index + 1] = tmp;
      this.commit();
    },
    next() {
      for (let i = 0; i < this.queue.length; i++) {
        if (this.queue[i].used) continue;
        this.queue[i].used = true;
        break;
      }
      popQueue();
    }
  }
})
</script>

<template>
  <div class="root">
    <main>
      <Button @click="next">Следующий вопрос</Button>
      <QueueQuestion v-for="(question, index) in queue" :question="question" @moveUp="moveUp(index)" @moveDown="moveDown(index)"/>
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