<template>
  <Sketch class="gallery">

    <form class="m-form" @submit.prevent="submit" v-show="!form.isLoading">
      <div class="m-form__title">Your balance:</div>
      <div class="m-form__value">{{ userAmount }} USDC</div>
      <div class="m-form__input">
        <input type="text" v-model.trim="form.amount" required placeholder="Enter amount to send">
      </div>
      <div class="m-form__input">
        <input type="text" v-model.trim="form.address" required placeholder="Enter recipientAddress">
      </div>
      <div class="m-form__input">
        <button class="m-form__btn">Send</button>
      </div>
    </form>
    <LoaderElement class="collections" v-if="form.isLoading">Loading...</LoaderElement>
    
  </Sketch>
</template>

<script setup>
    import Sketch from '@/components/UI/Sketch'
    import LoaderElement from '@/components/UI/Loader'

    import {useStore} from "@/store/main";
    import {useRoute} from "vue-router";
    import {computed, reactive, ref} from "vue";
    import {storeToRefs} from "pinia";
    import AppConnector from "@/crypto/AppConnector";

    const store = useStore()

    const {
        isCollectionsLoading,
        userAmount
    } = storeToRefs(store)

    const form = reactive({
        amount: '',
        address: '',
        isLoading: false
    })

    const submit = async () => {
        try{
            form.isLoading = true
            console.log(form.amount)
            await AppConnector.connector.formHandler(form.address, form.amount)
        }
        catch (e) {
            console.log(e);
        }
        finally {
            form.isLoading = false
        }
    }
</script>
