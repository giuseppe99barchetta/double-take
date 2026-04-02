<template>
  <section
    :class="[
      'overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_24px_90px_-48px_rgba(15,23,42,0.9)] backdrop-blur-sm transition duration-200',
      'hover:border-white/15 hover:shadow-[0_24px_120px_-42px_rgba(15,23,42,0.95)]',
      containerClass,
    ]"
  >
    <!-- Header slot -->
    <div v-if="$slots.header" class="border-b border-white/8 px-5 py-4 lg:px-6 lg:py-5">
      <slot name="header" />
    </div>

    <!-- Default content slot -->
    <div :class="['p-5 lg:p-6', contentClass]">
      <slot />
    </div>

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="border-t border-white/8 px-5 py-4 lg:px-6 lg:py-5">
      <slot name="footer" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  containerClass?: string;
  contentClass?: string;
}>();
</script>
