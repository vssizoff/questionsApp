<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type {MessageType} from "@/api/index.js";
import Panel from "primevue/panel";
import Button from "primevue/button";
import Textarea from "primevue/textarea";

export default defineComponent({
  name: "Question",
  components: {Textarea, Panel, Button},
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
      editing_: false
    };
  },
  computed: {
    status(): -2 | -1 | 0 | 1 | 2 {
      let textStatuses = this.question.texts.map(({status}) => status);
      return textStatuses.includes(2) ? 2 : textStatuses.includes(-2) ? -2 : textStatuses.includes(1) ? 1 : textStatuses.includes(0) ? 0 : -1;
    },
    text(): string /*| [string, string]*/ {
      return this.status === 1 ? this.question.texts.filter(({status}) => status === 1).sort(({id: id0}, {id: id1}) => id1 - id0)[0].text : this.question.texts[this.question.texts.length - 1].text;
    }
  },
  watch: {
    text() {
      this.editText = typeof this.text === "string" ? this.text : this.text[0];
    },
    editing_() {
      this.$emit("update:editing", this.editing);
    }
  },
  mounted() {
    this.editText = typeof this.text === "string" ? this.text : this.text[0];
  }
})
</script>

<template>
  <Panel :header="`№${question.id} ${status === -1 ? 'Отклонено' : status === 0 ? 'Ожидает просмотра админом' : status === 1 ? 'Разрешено' : 'Редактирование ожидает просмотра админом'}`">
    <p @click="editing_ = !editing_">{{text}}</p>
    <div class="editor" v-if="editing_">
      <Textarea v-model="editText" autoResize/>
      <span>
        <Button severity="danger" @click="editing_ = false; editText = typeof text === 'string' ? text : text[0]">Отменть</Button>
        <Button severity="success" @click="$emit('edit', editText); editing_ = false" :disabled="pending || !editText.length">Сохранить</Button>
      </span>
    </div>
    <br>
    <slot/>
  </Panel>
</template>

<style scoped>
p {
  cursor: pointer;
  font-size: 18px;
  display: inline-flex;
  overflow-wrap: anywhere;
  transition: transform .3s ease-in-out;
  text-align: center;

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

  span {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>