<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import Panel from "primevue/panel";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import Tag from "primevue/tag";
import TextArea from '@/components/TextArea.vue';
import {type QueueMessageType} from "@/api/queue.js";

export default defineComponent({
  name: "QueueQuestion",
  components: {Panel, Button, Drawer, Tag, TextArea},
  props: {
    question: {
      type: Object as PropType<QueueMessageType>,
      required: true
    }
  },
  data() {
    return {
      drawerOpened: false
    }
  },
  methods: {
    textHeader(id: number, status: number): string {
      return `№${id} ${status === -1 || status === -2 ? 'Отклонено' : status === 0 ? 'Ожидает просмотра админом' : status === 1 || status === 2 ? 'Разрешено' : 'Редактирование ожидает просмотра админом'}`;
    }
  }
})
</script>

<template>
  <Panel>
    <template #header>
      <header>
        <h3>Вопрос №{{question.id}} версия №{{question.text.id}}</h3>
        <Tag value="Отвечено" v-if="question.used"/>
      </header>
    </template>
    <p class="text">{{question.text.text}}</p>
    <div class="buttons">
      <Button @click="drawerOpened = !drawerOpened">Все версии</Button>
    </div>
    <Drawer position="right" v-model:visible="drawerOpened" style="width: 800px">
      <div class="versions">
        <Panel v-for="{status, id, text} in question.texts">
          <template #header>
            <Tag :value="textHeader(id, status)" :severity="status > 0 ? 'success' : status < 0 ? 'danger' : 'info'"/>
          </template>
          <p>{{text}}</p>
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