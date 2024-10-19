<script lang="ts">
import {defineComponent, watch} from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import {editMessage, getMessages, sendMessage, subscribeUser, user, userId} from "@/api/user.js";
import UserLogin from "@/views/user/UserLogin.vue";
import Textarea from "primevue/textarea";
import Panel from "primevue/panel";
import Question from "@/components/Question.vue";
import PendingIndicator from "@/components/PendingIndicator.vue";
import Toast from "primevue/toast";
import TextArea from "@/components/TextArea.vue";
import type {MessageType} from "@/api/index.js";

export default defineComponent({
  name: "UserView",
  components: {TextArea, PendingIndicator, Question, UserLogin, Button, Dialog, Textarea, Panel, Toast},
  data() {
    return {
      name: "",
      class_: "",
      pending: false,
      questions: [] as Array<MessageType>,
      text: "",
      closeSocket: () => {},
      mobile: window.matchMedia('(width < 800px)').matches
    }
  },
  computed: {
    user() {
      return user.value;
    },
    userId: {
      get(): number {return userId.value;},
      set(value: number) {userId.value = value;}
    }
  },
  async mounted() {
    await this.setup();
    watch(userId, async () => {
      this.closeSocket();
      await this.setup();
    });
    window.addEventListener("resize", () => {this.mobile = window.matchMedia('(width < 800px)').matches;});
  },
  unmounted() {
    this.closeSocket();
  },
  methods: {
    async send() {
      this.pending = true;
      let id = await sendMessage(this.text);
      this.pending = false;
      if (id === -1) {
        console.error("Server error");
        return;
      }
      this.questions.push({
        id,
        user: user.value,
        texts: [
          {
            id: 0,
            text: this.text,
            status: 0
          }
        ]
      });
      this.text = "";
    },
    async edit(index: number, text: string) {
      this.pending = true;
      await editMessage(this.questions[index].id, text);
      this.pending = false;
      this.questions[index].texts.push({
        id: Math.max(...this.questions[index].texts.map(({id}) => id), 0) + 1,
        text,
        status: 0
      });
    },
    async setup() {
      this.pending = true;
      this.questions = await getMessages();
      this.pending = false;
      this.closeSocket = subscribeUser(message => {
        this.$toast.add({severity: "info", summary: `Сообщение №${message.id} просмотрено админом`});
        this.change(message);
      }, message => {
        this.$toast.add({severity: "info", summary: `Сообщение №${message.id} отредактировано админом`});
        this.change(message);
      });
    },
    change(message: MessageType) {
      let index = this.questions.map(({id}) => id).indexOf(message.id);
      this.questions[index] = message;
    }
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
      <TextArea v-model="text"/>
      <Button @click="send" :disabled="!text.length || pending">Отправить</Button>
      <span v-if="!mobile">
        <Button severity="danger" @click="userId = -1" v-if="userId !== -1" class="logout">Выйти ({{user.username}} {{user.class}})</Button>
      </span>
    </div>
    <div v-if="questions">
      <h2>Вопросы (нажмите на текст для редактирования)</h2>
      <Question v-for="(question, index) in questions" :question="question" :pending="pending" @edit="edit(index, $event)"/>
    </div>
  </main>
  <span v-if="mobile">
    <Button severity="danger" @click="userId = -1" v-if="userId !== -1" class="logout">Выйти ({{user.username}} {{user.class}})</Button>
  </span>
  <PendingIndicator v-if="pending && userId !== -1"/>
</template>

<style scoped>
main {
  display: flex;
  gap: 40px;

  @media (width < 800px) {
    flex-direction: column;
  }

  & > div {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 50%;

    @media (width < 800px) {
      width: 100%;
    }
  }
}

.logout {
  margin-top: 40px;
}
</style>