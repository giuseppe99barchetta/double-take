<template>
  <BaseCard :container-class="containerClass" :content-class="contentClass">
    <template #header v-if="$slots.header">
      <slot name="header" />
    </template>
    <slot />
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from './BaseCard.vue';

defineProps<{
  containerClass?: string;
  contentClass?: string;
}>();
</script>