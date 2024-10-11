<script lang="ts">
import {defineComponent} from 'vue'
import Textarea from "primevue/textarea";

export default defineComponent({
  name: "TextArea",
  components: {Textarea},
  props: {
    modalValue: {
      type: String
    }
  },
  emits: {
    "update:modalValue": String
  },
  data() {
    return {
      value: this.modalValue,
      height: 0
    }
  },
  watch: {
    value() {
      this.$emit("update:modalValue", this.value);
      console.log(this.$refs.ref);
      this.height = "auto";
      this.$nextTick(() => {
        this.height = this.ref.scrollHeight - 40 + 'px';
      });
    }
  }
})
</script>

<template>
<Textarea v-model="value" ref="ref"/>
</template>

<style scoped>
textarea {
  height: v-bind(height);
}
</style>