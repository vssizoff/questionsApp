<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type {MessageType, TextType} from "@/api/index.js";
import Panel from "primevue/panel";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import Tag from "primevue/tag";
import TextArea from '@/components/TextArea.vue';
import {acceptMessage, rejectMessage} from "@/api/admin.js";

export default defineComponent({
  name: "QueueQuestion",
  components: {Panel, Button, Drawer, Tag, TextArea},
  props: {
    question: {
      type: Object as PropType<MessageType & {text: TextType}>,
      required: true
    }
  },
  data() {
    return {
      drawerOpened: false,
      editText: "",
      pending_: false,
      question_: this.question
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
        this.$emit("statusChange", this.question_.id);
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
        this.$emit("statusChange", this.question_.id);
        this.$toast.add({summary: "Request rejected", severity: "success"});
        this.question_.texts[textIndex].status = this.question_.texts[textIndex].status === 2 || this.question_.texts[textIndex].status === -2 ? -2 : -1;
        // this.removeQuestion(index);
      }
      else this.error();
    }
  }
})
</script>

<template>
  <Panel :header="`Вопрос №${question.id} версия №${question.text.id}`">
    <p class="text">{{question.text.text}}</p>
    <div>
      <Button @click="drawerOpened = !drawerOpened">Все версии</Button>
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
            <Button severity="success" @click="$emit('edit', editText)">Сохранить</Button>
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

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>