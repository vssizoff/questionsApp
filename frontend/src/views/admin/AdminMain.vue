<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import PendingIndicator from "@/components/PendingIndicator.vue";
import AdminTemplate from "@/views/admin/AdminTemplate.vue";
import type {MessageType} from "@/api/index.js";
import {subscribeAdmin} from "@/api/admin.js";

export default defineComponent({
  name: "AdminMain" ,
  components: {AdminTemplate, PendingIndicator},
  props: {
    getQuestions: {
      type: Object as PropType<() => Promise<Array<MessageType>>>,
      required: true
    },
    statuses: {
      type: Object as PropType<Array<number>>,
      default: []
    }
  },
  emits: {
    "update:pending"(_: boolean) {return true;}
  },
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
      if (!this.questions[index].texts.filter(({status}) => this.statuses.includes(status)).length) this.questions.splice(index, 1);
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
    this.questions = await this.getQuestions();
    this.pending = false;
    this.setupWebsocket();
  },
  unmounted() {
    this.closeSocket();
  }
})
</script>

<template>
  <AdminTemplate v-model:questions="questions" :statuses="statuses" :pending="pending" @update:pending="$emit('update:pending', $event)" @statusChange="set.add($event)" @adminEdit="setEdit.add($event)">
    <template #full><slot name="full"/></template>
    <slot/>
  </AdminTemplate>
  <PendingIndicator v-if="pending"/>
</template>

<style scoped>

</style>