<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import AdminQuestion from "@/views/admin/AdminQuestion.vue";
import Question from "@/components/Question.vue";
import Button from "primevue/button";
import type {MessageType} from "@/api/index.js";
import {acceptMessage, editMessage, rejectMessage} from "@/api/admin.js";

export default defineComponent({
  name: "AdminTemplate",
  components: {AdminQuestion, Question, Button},
  props: {
    questions: {
      type: Object as PropType<Array<MessageType>>,
      required: true
    },
    statuses: {
      type: Object as PropType<Array<number>>,
      default: []
    },
    pending: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    "update:questions"(_: Array<MessageType>) {return true;},
    "update:pending"(_: boolean) {return true;},
    "statusChange"(_: number) {return true;},
    "adminEdit"(_: number) {return true;}
  },
  data() {
    return {
      questions_: [] as Array<MessageType & {editing: boolean}>
    }
  },
  mounted() {
    this.questions_ = this.questions.map(question => ({...question, editing: false}));
  },
  computed: {
    pending_: {
      get() {
        return this.pending;
      },
      set(value: boolean) {
        this.$emit("update:pending", value);
      }
    }
  },
  watch: {
    questions_: {
      deep: true,
      handler() {
        this.$emit("update:questions", this.questions_.map(({id, user, texts}) => ({id, user, texts})));
      }
    },
    questions(value, oldValue) {
      if (JSON.stringify(value) !== JSON.stringify(oldValue)) this.questions_ = this.questions.map(question => ({...question, editing: false}));
    }
  },
  methods: {
    error() {
      this.$toast.add({summary: "Error happened. Is your admin password correct?", severity: "error"});
    },
    removeQuestion(index: number) {
      if (!this.questions_[index].texts.filter(({status}) => this.statuses.includes(status)).length) this.questions_.splice(index, 1);
    },
    async edit(index: number, text: string) {
      this.pending_ = true;
      let successful = await editMessage(this.questions_[index].id, text);
      this.pending_ = false;
      if (successful) {
        this.$emit("adminEdit", this.questions_[index].id);
        this.questions_[index].texts.push({
          id: Math.max(...this.questions_[index].texts.map(({id}) => id), 0) + 1,
          text,
          status: 1
        });
      }
      else this.error();
    },
    async accept(index: number, textIndex: number) {
      this.pending_ = true;
      let successful = await acceptMessage(this.questions_[index].texts[textIndex].id);
      this.pending_ = false;
      if (successful) {
        this.$emit("statusChange", this.questions_[index].id);
        this.$toast.add({summary: "Request accepted", severity: "success"});
        this.questions_[index].texts[textIndex].status = this.questions_[index].texts[textIndex].status === 2 || this.questions_[index].texts[textIndex].status === -2 ? 2 : 1;
        this.removeQuestion(index);
      }
      else this.error();
    },
    async reject(index: number, textIndex: number) {
      this.pending_ = true;
      let successful = await rejectMessage(this.questions_[index].texts[textIndex].id);
      this.pending_ = false;
      if (successful) {
        this.$emit("statusChange", this.questions_[index].id);
        this.$toast.add({summary: "Request rejected", severity: "success"});
        this.questions_[index].texts[textIndex].status = this.questions_[index].texts[textIndex].status === 2 || this.questions_[index].texts[textIndex].status === -2 ? -2 : -1;
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
      <h2 v-if="!questions.length && !pending_" v-text="'<Пусто>'"/>
      <AdminQuestion v-for="(question, i) in questions" :question="question" :pending="pending_" @edit="edit(i, $event)" v-slot="{index, status}">
        <div class="buttons">
          <slot name="full">
            <Button severity="danger" :disabled="pending_" @click="reject(i, index)" v-if="status !== -1 && status !== -2">Отклонить</Button>
            <Button severity="success" :disabled="pending_" @click="accept(i, index)" v-if="status !== 1 && status !== 2">Разрешить</Button>
            <slot/>
          </slot>
        </div>
      </AdminQuestion>
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

.buttons {
  display: flex;
  gap: 10px;
}
</style>