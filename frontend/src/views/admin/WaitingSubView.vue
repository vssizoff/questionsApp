<script lang="ts">
import {defineComponent} from 'vue'
import Question from "@/components/Question.vue";
import type {MessageType} from "@/api/index.js";
import {acceptMessage, editMessage, getWaitingMessages, rejectMessage} from "@/api/admin.js";
import Button from "primevue/button";
import AdminQuestion from "@/views/admin/AdminQuestion.vue";

export default defineComponent({
  name: "WaitingSubView",
  components: {AdminQuestion, Question, Button},
  data() {
    return {
      pending: false,
      questions: [] as Array<MessageType & {editing: boolean}>
    }
  },
  async mounted() {
    this.pending = true;
    this.questions = (await getWaitingMessages()).map(question => ({...question, editing: false}));
    this.pending = false;
  },
  methods: {
    error() {
      this.$toast.add({summary: "Error happened. Is your admin password correct?", severity: "error"});
    },
    removeQuestion(index: number) {
      if (!this.questions[index].texts.filter(({status}) => status === 0).length) this.questions.splice(index, 1);
    },
    async edit(index: number, text: string) {
      this.pending = true;
      let successful = await editMessage(this.questions[index].id, text);
      this.pending = false;
      if (successful) {
        this.questions[index].texts.push({
          id: Math.max(...this.questions[index].texts.map(({id}) => id), 0) + 1,
          text,
          status: 1
        });
      }
      else this.error();
    },
    async accept(index: number, textIndex: number) {
      this.pending = true;
      let successful = await acceptMessage(this.questions[index].texts[textIndex].id);
      this.pending = false;
      if (successful) {
        this.$toast.add({summary: "Request accepted", severity: "success"});
        this.questions[index].texts[textIndex].status = this.questions[index].texts[textIndex].status === 2 || this.questions[index].texts[textIndex].status === -2 ? 2 : 1;
        this.removeQuestion(index);
      }
      else this.error();
    },
    async reject(index: number, textIndex: number) {
      this.pending = true;
      let successful = await rejectMessage(this.questions[index].texts[textIndex].id);
      this.pending = false;
      if (successful) {
        this.$toast.add({summary: "Request rejected", severity: "success"});
        this.questions[index].texts[textIndex].status = this.questions[index].texts[textIndex].status === 2 || this.questions[index].texts[textIndex].status === -2 ? -2 : -1;
        this.removeQuestion(index);
      }
      else this.error();
    }
  }
})
</script>

<template>
  <div class="root">
    <main>
      <h2 v-if="!questions.length" v-text="'<Пусто>'"/>
      <AdminQuestion v-for="(question, index) in questions" :question="question" :pending="pending" @edit="edit(index, $event)" @accept="accept(index, $event)" @reject="reject(index, $event)"/>
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