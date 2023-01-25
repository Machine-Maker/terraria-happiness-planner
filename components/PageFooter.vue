<template>
  <VFooter id="footer" app class="w-100">
    <VContainer>
      <VRow align="center" class="text-center">
        <VCol><span>&copy; 2023 Machine Maker</span></VCol>
        <VCol>
          <VBtn prepend-icon="mdi-github" color="primary" href="https://github.com/Machine-Maker/terraria-happiness-planner" target="_blank">
            <template #prepend>
              <VIcon icon="mdi-github" size="x-large" />
            </template>
            <template #append>
              <VIcon icon="mdi-open-in-new" />
            </template>
            Source
          </VBtn>
        </VCol>
      </VRow>
    </VContainer>
  </VFooter>
</template>
