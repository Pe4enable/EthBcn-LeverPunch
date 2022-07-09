<template>
  <template v-if="isAppReady">
    <router-view/>
    <ChooseWalletModal/>
    <ConfirmModal/>
    <AlertModal/>
    <TransactionViewModal/>
  </template>
  <LoaderElement v-else class="absolute with-bg"/>

  <WalletConnectQRModal/>
</template>

<script setup>
    import AlertModal from '@/components/UI/Alert'
    import ConfirmModal from '@/components/UI/Confirm'
    import ChooseWalletModal from '@/components/modals/chooseWallet/Modal'
    import LoaderElement from '@/components/UI/Loader'
    import WalletConnectQRModal from '@/components/modals/walletConnectQR/Modal'
    import TransactionViewModal from '@/components/modals/TransactionView'

    import AppConnector from "@/crypto/AppConnector";
    import {useStore} from "@/store/main";
    import {storeToRefs} from "pinia";
    import {onMounted} from "vue";
    const store = useStore()
    const {
        isAppReady
    } = storeToRefs(store);

    onMounted(async () => {
        try{
            await AppConnector.init()
        }
        catch (e){
            console.log('user not connected', e);
        }
        finally {
            store.setAppReady()
        }
    })
</script>