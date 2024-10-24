<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type {MessageType} from "@/api/index.js";
import Panel from "primevue/panel";
import Button from "primevue/button";
import TextArea from "@/components/TextArea.vue";
import Tag from "primevue/tag";

export default defineComponent({
  name: "AdminQuestion",
  components: {TextArea, Panel, Button, Tag},
  props: {
    question: {
      type: Object as PropType<MessageType>,
      required: true
    },
    pending: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    edit(_: string) {return true;},
    accept(_: number) {return true;},
    reject(_: number) {return true;}
  },
  data() {
    return {
      editText: "",
      editing: false
    };
  },
  methods: {
    header(id: number, status: number): string {
      return `№${id} ${status === -1 || status === -2 ? 'Отклонено' : status === 0 ? 'Ожидает просмотра админом' : status === 1 || status === 2 ? 'Разрешено' : 'Редактирование ожидает просмотра админом'}`;
    }
  }
})
</script>

<template>
  <header>
    <h2>№{{question.id}} от {{question.user.username}} {{question.user.class}}</h2>
    <Button @click="editing = !editing">Редактировать</Button>
  </header>
  <Panel class="editor" v-if="editing" header="Редактирование">
    <TextArea v-model="editText" autoResize/>
    <span>
      <Button severity="danger" @click="editing = false">Отменть</Button>
      <Button severity="success" @click="$emit('edit', editText); editing = false" :disabled="pending || !editText.length">Сохранить</Button>
    </span>
  </Panel>
  <Panel v-for="({status, id, text}, index) in question.texts">
    <template #header>
      <Tag :value="header(id, status)" :severity="status > 0 ? 'success' : status < 0 ? 'danger' : 'info'"/>
    </template>
    <p>{{text}}</p>
    <slot :index="index" :text="text" :id="id" :status="status"/>
  </Panel>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 20px;
}

p {
  font-size: 18px;
  display: inline-flex;
  overflow-wrap: anywhere;
  margin: 0 0 20px 0;
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
</style>