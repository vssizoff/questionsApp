<script lang="ts">
import {defineComponent} from 'vue'
import Button from "primevue/button";
import UserLogin from "@/views/user/UserLogin.vue";
import {adminPassword} from "@/api/admin.js";
import Dialog from "primevue/dialog";
import Password from "primevue/password";

export default defineComponent({
  name: "AdminView",
  components: {UserLogin, Button, Dialog, Password},
  data() {
    return {
      password: ""
    }
  },
  computed: {
    adminPassword: {
      get(): string {
        return adminPassword.value;
      },
      set(value: string) {
        adminPassword.value = value;
      }
    }
  }
})
</script>

<template>
  <Dialog :visible="adminPassword === ''" modal>
    <template #container>
      <div class="password">
        <h2>Admin password</h2>
        <div class="form">
          <Password toggleMask v-model="password" :feedback="false"/>
          <Button @click="adminPassword = password">Set password</Button>
        </div>
      </div>
    </template>
  </Dialog>
  <header v-if="adminPassword !== ''">
    <nav>
      <RouterLink to="/admin/accepted"><Button severity="success">Очередь</Button></RouterLink>
      <RouterLink to="/admin"><Button severity="warn">Ожидают проверки</Button></RouterLink>
      <RouterLink to="/admin/rejected"><Button severity="danger">Отклонено</Button></RouterLink>
    </nav>
    <Button severity="danger" @click="adminPassword = ''">Сменить пароль</Button>
  </header>
  <RouterView v-if="adminPassword !== ''"/>
</template>

<style scoped>
.password {
  text-align: center;
  padding: 20px;

  h2 {
    margin: 0 0 20px 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

header {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 20px;

  nav {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
}
</style>