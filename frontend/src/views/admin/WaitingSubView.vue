<script lang="ts">
import {defineComponent} from 'vue'
import Question from "@/components/Question.vue";

export default defineComponent({
  name: "WaitingSubView",
  components: {Question}
})
</script>

<template>
  <main>
    <Question v-for="(question, index) in questions" :question="question" :pending="pending" @edit="edit(index, $event)"/>
  </main>
</template>

<style scoped>

</style>