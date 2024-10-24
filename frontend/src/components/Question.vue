<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type {MessageType} from "@/api/index.js";
import Panel from "primevue/panel";
import Button from "primevue/button";
import TextArea from "@/components/TextArea.vue";
import Tag from "primevue/tag";
import Drawer from "primevue/drawer";

export default defineComponent({
  name: "Question",
  components: {TextArea, Panel, Button, Tag, Drawer},
  props: {
    question: {
      type: Object as PropType<MessageType>,
      required: true
    },
    pending: {
      type: Boolean,
      default: false
    },
    editing: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    edit(_: string) {return true;},
    "update:editing"(_: boolean) {return true;}
  },
  data() {
    return {
      editText: "",
      editing_: false,
      drawerOpened: false
    };
  },
  computed: {
    status(): -2 | -1 | 0 | 1 | 2 {
      let textStatuses = this.question.texts.map(({status}) => status);
      return textStatuses.includes(2) ? 2 : textStatuses.includes(-2) ? -2 : textStatuses.includes(1) ? 1 : textStatuses.includes(0) ? 0 : -1;
    },
    text(): string /*| [string, string]*/ {
      // return this.status === 1 ? this.question.texts.filter(({status}) => status === 1).sort(({id: id0}, {id: id1}) => id1 - id0)[0].text : this.question.texts[this.question.texts.length - 1].text;
      return this.question.texts[this.question.texts.length - 1].text;
    },
    header() {
      return `№${this.question.id} ${this.status === -1 ? 'Отклонено' : this.status === 0 ? 'Ожидает просмотра админом' : this.status === 1 ? 'Разрешено' : 'Редактирование ожидает просмотра админом'}`;
    }
  },
  watch: {
    text() {
      this.editText = this.text;
    },
    editing_() {
      this.$emit("update:editing", this.editing);
    }
  },
  mounted() {
    this.editText = this.text;
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
      <Tag :value="header" :severity="status > 0 ? 'success' : status < 0 ? 'danger' : 'info'"/>
    </template>
    <h4 v-if="question.texts.length > 1">Последняя версия:</h4>
    <p @click="editing_ = !editing_" class="editable">{{text}}</p>
    <br>
    <footer>
      <Button @click="editing_ = !editing_">Редактировать</Button>
      <Button v-if="question.texts.length > 1" @click="drawerOpened = !drawerOpened">Все версии</Button>
    </footer>
    <div class="editor" v-if="editing_">
      <TextArea v-model="editText" autoResize/>
      <span>
        <Button severity="danger" @click="editing_ = false; editText = text">Отменть</Button>
        <Button severity="success" @click="$emit('edit', editText); editing_ = false" :disabled="pending || !editText.length">Сохранить</Button>
      </span>
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
    <slot/>
  </Panel>
</template>

<style scoped>
h4 {
  margin: 0;
}

p {
  font-size: 18px;
  display: inline-flex;
  overflow-wrap: anywhere;
  margin: 0;
}

.editable {
  margin: 10px 0;
  cursor: pointer;
  transition: transform .3s ease-in-out;

  @media (hover: hover) {
    &:hover {
      transform: scale(1.02);
    }
  }
  &:focus-visible {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(1.05);
  }
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;

  span {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

footer {
  display: flex;
  align-items: center;
  gap: 20px;
}

.versions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>