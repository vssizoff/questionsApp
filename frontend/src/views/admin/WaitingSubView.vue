<script lang="ts">
import {defineComponent} from 'vue'
import {getWaitingMessages} from "@/api/admin.js";
import AdminMain from "@/views/admin/AdminMain.vue";

export default defineComponent({
  name: "WaitingSubView",
  methods: {getWaitingMessages},
  components: {AdminMain}
})
</script>

<template>
  <AdminMain :getQuestions="() => getWaitingMessages()"/>
</template>