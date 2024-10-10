<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type {MessageType} from "@/api/user.js";
import Panel from "primevue/panel";
import Button from "primevue/button";
import Textarea from "primevue/textarea";

export default defineComponent({
  name: "Question",
  components: {Panel, Button, Textarea},
  props: {
    question: {
      type: Object as PropType<MessageType>,
      required: true
    }
  },
  emits: {
    change(str: string) {return true;}
  },
  data() {
    return {
      editText: "",
      editing: false
    };
  },
  computed: {
    status(): -2 | -1 | 0 | 1 | 2 {
      let textStatuses = this.question.texts.map(({status}) => status);
      return textStatuses.includes(1) ? 1 : textStatuses.includes(2) ? 2 : textStatuses.includes(-2) ? -2 : textStatuses.includes(0) ? 0 : -1;
    },
    text(): string | [string, string] {
      return this.status === 1 ? this.question.texts.filter(({status}) => status === 1).sort(({id: id0}, {id: id1}) => id1 - id0)[0].text : this.question.texts[this.question.texts.length - 1].text;
    }
  },
  watch: {
    text() {
      this.editText = typeof this.text === "string" ? this.text : this.text[0];
    }
  },
  mounted() {
    this.editText = typeof this.text === "string" ? this.text : this.text[0];
  }
})
</script>

<template>
  <Panel :header="`№${question.id} ${status === -1 ? 'Отклонено' : status === 0 ? 'Ожидает просмотра админом' : status === 1 ? 'Разрешено' : 'Редактирование ожидает просмотра админом'}`">
    <p @click="editing = !editing">{{text}}</p>
    <div class="editor" v-if="editing">
      <Textarea v-model="editText"/>
      <span>
        <Button severity="danger" @click="editing = false; editText = typeof text === 'string' ? text : text[0]">Отменть</Button>
        <Button severity="success" @click="$emit('change', editText)">Сохранить</Button>
      </span>
    </div>
  </Panel>
</template>

<style scoped>
p {
  cursor: pointer;
  font-size: 18px;
  display: inline-block;
  transition: transform .3s ease-in-out;

  @media (hover: hover) {
    &:hover {
      transform: scale(1.2);
    }
  }
  &:focus-visible {
    transform: scale(1.3);
  }

  &:active {
    transform: scale(1.4);
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