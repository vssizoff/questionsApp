<script lang="ts">
import {defineComponent} from 'vue'
import Question from "@/components/Question.vue";
import type {MessageType} from "@/api/index.js";
import {getWaitingMessages, subscribeAdmin} from "@/api/admin.js";
import Button from "primevue/button";
import AdminQuestion from "@/views/admin/AdminQuestion.vue";
import AdminMain from "@/views/admin/AdminMain.vue";
import PendingIndicator from "@/components/PendingIndicator.vue";

export default defineComponent({
  name: "WaitingSubView",
  components: {PendingIndicator, AdminMain, AdminQuestion, Question, Button},
  data() {
    return {
      pending: false,
      questions: [] as Array<MessageType>,
      closeSocket: () => {},
      set: new Set<number>,
      setEdit: new Set<number>
    }
  },
  methods: {
    removeQuestion(index: number) {
      if (!this.questions[index].texts.filter(({status}) => status === 0).length) this.questions.splice(index, 1);
    },
    change(message: MessageType) {
      let index = -1;
      this.questions = this.questions.map((question, i) => {
        if (question.id !== message.id) return question;
        index = i;
        return message;
      });
      if (index === -1) {
        this.questions.push(message);
        index = this.questions.length - 1;
      }
      this.removeQuestion(index);
    },
    setupWebsocket() {
      this.closeSocket = subscribeAdmin(message => {
        if (this.set.has(message.id)) {
          this.set.delete(message.id);
          return;
        }
        this.change(message);
        this.$toast.add({summary: `Изменён статус сообщения №${message.id}`});
      }, message => {
        if (this.setEdit.has(message.id)) {
          this.setEdit.delete(message.id);
          return;
        }
        this.change(message);
        this.$toast.add({summary: `Сообщение №${message.id} изменено администратором`});
      }, message => {
        this.change(message);
        this.$toast.add({summary: `Добавлено сообщения №${message.id}`});
      }, message => {
        this.change(message);
        this.$toast.add({summary: `Сообщение №${message.id} изменено`});
      });
    }
  },
  async mounted() {
    this.pending = true;
    this.questions = (await getWaitingMessages()).map(question => ({...question, editing: false}));
    this.pending = false;
    this.setupWebsocket();
  },
  unmounted() {
    this.closeSocket();
  }
})
</script>

<template>
  <AdminMain v-model:questions="questions" :statuses="[0]" v-model:pending="pending" @statusChange="set.add($event)" @adminEdit="setEdit.add($event)"/>
  <PendingIndicator v-if="pending"/>
</template>