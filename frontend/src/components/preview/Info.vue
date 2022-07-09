<template>
  <div class="token-data">
    <div>
      <ToggleElement v-model="isJSONMode">JSON mode view</ToggleElement>
    </div>
    <div>
      <InfoJson v-if="isJSONMode" :structure="props.token.structure"/>
      <InfoVisual v-else :props="props.token.fieldsForView"/>
    </div>
  </div>
</template>

<script setup>
    import ToggleElement from '@/components/UI/Toggle'
    import {ref} from "vue";
    import InfoVisual from '@/components/preview/InfoVisual'
    import InfoJson from '@/components/preview/InfoJSON'

    const props = defineProps(['token'])
    const isJSONMode = ref(false)
</script>
