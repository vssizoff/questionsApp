<script lang="ts">
import {defineComponent, watch} from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import {getMessages, type MessageType, userId} from "@/api/user.js";
import UserLogin from "@/views/user/UserLogin.vue";
import Textarea from "primevue/textarea";
import Panel from "primevue/panel";
import Question from "@/components/Question.vue";

export default defineComponent({
  name: "UserView",
  components: {Question, UserLogin, Button, Dialog, Textarea, Panel},
  data() {
    return {
      name: "",
      class_: "",
      pending: false,
      questions: [] as Array<MessageType>
    }
  },
  computed: {
    userId: {
      get(): number {return userId.value;},
      set(value: number) {userId.value = value;}
    }
  },
  async mounted() {
    this.questions = await getMessages();
    watch(userId, async () => {
      this.questions = await getMessages();
    });
  }
});
</script>

<template>
  <Dialog :visible="userId === -1" modal>
    <template #container>
      <UserLogin/>
    </template>
  </Dialog>
  <main v-if="userId !== -1">
    <div>
      <h2>Создать вопрос</h2>
      <Textarea/>
      <Button>Отправить</Button>
    </div>
    <div v-if="questions">
      <h2>Вопросы (нажмите на текст для редактирования)</h2>
      <Question v-for="question in questions" :question="question"/>
    </div>
  </main>
  <Button severity="danger" @click="userId = -1">Выйти</Button>
</template>

<style scoped>
main {
  display: flex;
  gap: 40px;

  & > div {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}
</style>