<script lang="ts">
import {defineComponent} from 'vue'
import {logIn} from "@/api/user.js";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";

export default defineComponent({
  name: "UserLogin",
  components: {Button, FloatLabel, InputText},
  data() {
    return {
      name: "",
      class_: "",
      pending: false
    };
  },
  methods: {
    async logIn() {
      this.pending = true;
      await logIn(this.name, this.class_);
      this.pending = false;
    }
  }
})
</script>

<template>
  <div class="form">
    <h2>Введите ваше имя и класс</h2>
    <FloatLabel variant="on">
      <InputText id="name-input" v-model="name"/>
      <label for="name-input">Имя</label>
    </FloatLabel>
    <FloatLabel variant="on">
      <InputText id="name-class" v-model="class_"/>
      <label for="name-class">Класс (с буквой)</label>
    </FloatLabel>
    <Button @click="logIn" :disabled="pending || !name.length || !class_.length">Войти</Button>
  </div>
</template>

<style scoped>
.form {
  margin: 10px;
  display: flex;
  gap: 20px;
  flex-direction: column;

  h2 {
    margin: 0;
  }

  & > *, & > * > input {
    width: 100%;
  }
}
</style>