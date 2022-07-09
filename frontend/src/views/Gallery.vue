<template>
  <Sketch class="gallery">
    <LoaderElement class="collections" v-if="isCollectionsLoading">Loading...</LoaderElement>
    
  </Sketch>
  <PreviewToken/>
</template>

<script setup>
    import Sketch from '@/components/UI/Sketch'
    import LoaderElement from '@/components/UI/Loader'

    import {useStore} from "@/store/main";
    import {useRoute} from "vue-router";
    import {computed, ref} from "vue";
    import {storeToRefs} from "pinia";
    import AppConnector from "@/crypto/AppConnector";

    const isJSON = ref(false)

    const store = useStore()

    const {
        isCollectionsLoading
    } = storeToRefs(store)

    const route = useRoute()
    const collections = computed(() => {
        //return store.getFilteredCollections(CollectionType.getTypeByPageName(route.name))
    })

    const chooseToken = token => {
        store.openPreview(token)
    }
</script>
