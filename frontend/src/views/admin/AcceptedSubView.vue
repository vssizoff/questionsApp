<script lang="ts">
import {defineComponent} from 'vue'
import {getQueue, patchQueue, popQueue, type QueueMessageType, subscribeQueue} from "@/api/queue.js";
import QueueQuestion from "@/views/admin/QueueQuestion.vue";
import Button from "primevue/button";

export default defineComponent({
  name: "AcceptedSubView",
  components: {QueueQuestion, Button},
  data() {
    return {
      queue: [] as Array<QueueMessageType>,
      closeWebsocket: () => {}
    }
  },
  async mounted() {
    this.queue = await getQueue();
    this.setupWebsocket();
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
    },
    setupWebsocket() {
      this.closeWebsocket = subscribeQueue((queue) => {
        this.queue = queue;
        this.$toast.add({summary: "Порядок вопросов изменён"});
      }, (elem) => {
        this.queue = this.queue.map(({id, text, used, ...other}) => (id === elem.id ? {...elem, text, used} : {id, text, used, ...other}));
        this.queue.push(elem);
        this.$toast.add({summary: "Добавлен вопрос"});
      }, () => {
        for (let i = 0; i < this.queue.length; i++) {
          if (this.queue[i].used) continue;
          this.queue[i].used = true;
          break;
        }
        this.$toast.add({summary: "Вопрос отвечен"});
      }, (id) => {
        this.queue = this.queue.filter(({text: {id: ID}}) => ID !== id);
        this.queue = this.queue.map(({texts, ...other}) => ({...other, texts: texts.map(({id: ID, text, status}) => (ID === id ? {id, text, status: -1} : {id: ID, text, status}))}));
        this.$toast.add({summary: "Вопрос удалён"});
      }, (from, to) => {
        this.queue = this.queue.map(elem => elem.text.id === from ? to : elem);
        this.$toast.add({summary: "Вопрос заменён"});
      });
    }
  },
  unmounted() {
    this.closeWebsocket();
  }
})
</script>

<template>
  <div class="root">
    <main>
      <Button v-if="queue.length" @click="next">Следующий вопрос</Button>
      <h2 v-if="!queue.length" v-text="'<Пусто>'"/>
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