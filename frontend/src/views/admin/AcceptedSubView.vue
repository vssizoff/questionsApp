<script lang="ts">
import {defineComponent} from 'vue'
import type {MessageType, TextType} from "@/api/index.js";
import {getQueue} from "@/api/queue.js";
import QueueQuestion from "@/views/admin/QueueQuestion.vue";

export default defineComponent({
  name: "AcceptedSubView",
  components: {QueueQuestion},
  data() {
    return {
      queue: [] as Array<MessageType & {text: TextType}>
    }
  },
  async mounted() {
    this.queue = await getQueue();
  }
})
</script>

<template>
<QueueQuestion v-for="question in queue" :question="question"/>
</template>