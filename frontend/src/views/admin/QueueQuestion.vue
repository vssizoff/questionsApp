<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import Panel from "primevue/panel";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import Tag from "primevue/tag";
import TextArea from '@/components/TextArea.vue';
import {acceptMessage, editMessage, rejectMessage} from "@/api/admin.js";
import upward from "@/assets/upward.svg";
import downward from "@/assets/downward.svg";
import type {QueueMessageType} from "@/api/queue.js";

export default defineComponent({
  name: "QueueQuestion",
  components: {Panel, Button, Drawer, Tag, TextArea},
  props: {
    question: {
      type: Object as PropType<QueueMessageType>,
      required: true
    }
  },
  emits: {
    moveUp(_: undefined) {return true;},
    moveDown(_: undefined) {return true;}
  },
  data() {
    return {
      drawerOpened: false,
      editText: "",
      pending_: false,
      question_: this.question,
      upward, downward
    }
  },
  methods: {
    textHeader(id: number, status: number): string {
      return `№${id} ${status === -1 || status === -2 ? 'Отклонено' : status === 0 ? 'Ожидает просмотра админом' : status === 1 || status === 2 ? 'Разрешено' : 'Редактирование ожидает просмотра админом'}`;
    },
    error() {
      this.$toast.add({summary: "Error happened. Is your admin password correct?", severity: "error"});
    },
    async accept(textIndex: number) {
      this.pending_ = true;
      let successful = await acceptMessage(this.question_.texts[textIndex].id);
      this.pending_ = false;
      if (successful) {
        // this.$emit("statusChange", this.question_.id);
        this.$toast.add({summary: "Request accepted", severity: "success"});
        this.question_.texts[textIndex].status = this.question_.texts[textIndex].status === 2 || this.question_.texts[textIndex].status === -2 ? 2 : 1;
        // this.removeQuestion(index);
      }
      else this.error();
    },
    async reject(textIndex: number) {
      this.pending_ = true;
      let successful = await rejectMessage(this.question_.texts[textIndex].id);
      this.pending_ = false;
      if (successful) {
        // this.$emit("statusChange", this.question_.id);
        this.$toast.add({summary: "Request rejected", severity: "success"});
        this.question_.texts[textIndex].status = this.question_.texts[textIndex].status === 2 || this.question_.texts[textIndex].status === -2 ? -2 : -1;
        // this.removeQuestion(index);
      }
      else this.error();
    },
    async edit() {
      this.pending_ = true;
      let successful = await editMessage(this.question_.id, this.editText);
      this.pending_ = false;
      if (successful) {
        // this.$emit("adminEdit", this.question_.id);
        this.question_.texts.push({
          id: Math.max(...this.question_.texts.map(({id}) => id), 0) + 1,
          text: this.editText,
          status: 1
        });
      }
      else this.error();
    }
  }
})
</script>

<template>
  <Panel>
    <template #header>
      <header>
        <h3>Вопрос №{{question.id}} версия №{{question.text.id}}</h3>
        <Tag value="Отвечено" v-if="question_.used"/>
      </header>
    </template>
    <p class="text">{{question.text.text}}</p>
    <div class="buttons">
      <Button @click="drawerOpened = !drawerOpened">Все версии</Button>
      <Button @click="$emit('moveUp', undefined)"><img :src="upward" alt="upward"></Button>
      <Button @click="$emit('moveDown', undefined)"><img :src="downward" alt="downward"></Button>
    </div>
    <Drawer position="right" v-model:visible="drawerOpened" style="width: 800px">
      <div class="versions">
        <Panel v-for="({status, id, text}, i) in question.texts">
          <template #header>
            <Tag :value="textHeader(id, status)" :severity="status > 0 ? 'success' : status < 0 ? 'danger' : 'info'"/>
          </template>
          <p>{{text}}</p>
          <div class="buttons">
            <Button severity="danger" :disabled="pending_" @click="reject(i)" v-if="status !== -1 && status !== -2">Отклонить</Button>
            <Button severity="success" :disabled="pending_" @click="accept(i)" v-if="status !== 1 && status !== 2">Разрешить</Button>
          </div>
        </Panel>
        <Panel class="editor" header="Редактирование">
          <TextArea v-model="editText" autoResize/>
          <span>
            <Button severity="success" @click="edit">Сохранить</Button>
          </span>
        </Panel>
      </div>
    </Drawer>
  </Panel>
</template>

<style scoped>
.text {
  margin: 10px 0;
}

p {
  font-size: 18px;
  display: inline-flex;
  overflow-wrap: anywhere;
  text-align: center;
  margin: 0;
}

.versions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 20px;

  textarea {
    width: 100%;
    margin-bottom: 20px;
  }

  span {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

h3 {
  margin: 0;
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

header {
  display: inline-flex;
  gap: 20px;
}
</style>