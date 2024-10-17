<script lang="ts">
import {defineComponent} from 'vue'
import {getRejectedMessages} from "@/api/admin.js";
import AdminMain from "@/views/admin/AdminMain.vue";

export default defineComponent({
  name: "RejectedSubView",
  methods: {getRejectedMessages},
  components: {AdminMain}
})
</script>

<template>
  <AdminMain :getQuestions="() => getRejectedMessages()" :statuses="[-1, -2]"/>
</template>