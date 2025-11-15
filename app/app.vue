<template>
  <UApp>
    <UHeader :toggle="false">
      <template #left>
        <NuxtLink to="/" class="font-bold text-xl"> EpiGen </NuxtLink>
      </template>
      <template #right>
        <SkillSettingsPanel />
      </template>
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
