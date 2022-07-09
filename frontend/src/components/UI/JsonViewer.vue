<template>
  <div class="myjsoneditor" ref="viewerElement"></div>
</template>

<script setup>
    import JSONEditor from "jsoneditor/dist/jsoneditor.min.js"
    import {ref, onMounted, onBeforeUnmount, watch} from "vue";

    const props = defineProps({
        jsonObject: {
            type: Object,
            required: false,
            default: {}
        }
    })
    const emits = defineEmits(['onEvent'])

    const viewerElement = ref(null)
    let JSONViewerInstance = null

    const setJson = (json) => {
        console.log('setJson', json);
        JSONViewerInstance.set(json)
    }

    watch(props, (newProps) => {
        if(newProps.jsonObject) setJson(newProps.jsonObject)
    })

    onMounted(() => {
        JSONViewerInstance = new JSONEditor(viewerElement.value, {
            limitDragging: true,
            navigationBar: false,
            mode: 'view',
            onEvent: (v, e) => {
                const elementName = v.field
                if(!elementName) return;
                emits('onEvent', {
                    field: elementName,
                    type: e.type
                })
            }
        })
        setJson(props.jsonObject)
    })

    onBeforeUnmount(() => {
        if(JSONViewerInstance){
            JSONViewerInstance.destroy()
            JSONViewerInstance = null
        }
    })
</script>