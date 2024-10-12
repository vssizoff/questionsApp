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
    "update:modalValue"(_: string) {return true;}
  },
  data() {
    return {
      value: this.modalValue ?? "",
      height: "64px"
    }
  },
  methods: {
    scrollHeight(): number {
      // @ts-ignore
      return this.$refs.ref.$el.scrollHeight;
    },
    resize() {
      this.height = "auto";
      this.$nextTick(() => {
        this.height = this.scrollHeight() + 2 + 'px';
      });
    }
  },
  watch: {
    value() {
      this.$emit("update:modalValue", this.value);
      this.resize();
    },
    modalValue() {
      this.resize();
    }
  },
  mounted() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
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