import {
    Networks,
    ConnectionStore,
    Formatters,
    AppStorage,
    Token,
    DecentralizedStorage,
    getErrorTextByCode
} from '@/crypto/helpers'
import SmartContract from '@/crypto/EVM/SmartContract.js'
import {stringCompare} from "@/utils/string";
import alert from "@/utils/alert";
import {ethers} from "ethers";
import {log} from "@/utils/AppLogger";
import {getData} from "@/crypto/helpers/Networks";

class EVM {

    constructor(){

    }


    /* ---------- Connected methods ON  ----------  */
    async init(){
        return await this.connector.init(this)
    }
    async connectToWallet(value){
        return await this.connector.connectToWallet(value)
    }
    async disconnect(){
        return await this.connector.disconnect()
    }
    async isUserConnected(){
        return await this.connector.isUserConnected()
    }
    /*  ----------  Connected methods OFF  ----------  */


    async fetchUserAmount(){
        const storage = AppStorage.getStore()
        const userIdentity = ConnectionStore.getUserIdentity()
        const {fetchAmount} = Networks.getData(ConnectionStore.getNetwork().name)

        const Contract = new SmartContract({
            address: fetchAmount
        })
        const amount = await Contract.fetchUserBalance(userIdentity)
        storage.setUserAmount(amount)
    }

    async formHandler(address, amount){
        const {fetchAmount} = Networks.getData(ConnectionStore.getNetwork().name)

        const Contract = new SmartContract({
            address: fetchAmount
        })
        console.log(amount)
        Contract.formHandler(amount, address)
    }

    async fetchUserTokens(){

    }

    async getContractObject(address, byPlain = false){
        const userIdentity = ConnectionStore.getUserIdentity()
        const {api} = Networks.getSettings(ConnectionStore.getNetwork().name)
        if(api && !byPlain && +process.env.VUE_APP_OPENSEA_PROVIDER){
            console.log('getting contract by API')
            try{
                const tokens = await this.getContractTokens(address, byPlain)

                let contract = await API.fetchContract(address)
                contract = Formatters.contractFormat({
                    address,
                    tokens,
                    name: contract.name,
                    symbol: contract.symbol
                })

                return contract
            }
            catch (e) {
                console.log('getContractObject by API error', e)
                return await this.getContractObject(address, true)
            }
        }
        else {
            console.log('getting contract by plain')
            const contract = new SmartContract({
                address,
                type: 'bundle'
            })
            let contractObject = Formatters.contractFormat(await contract.getObjectForUser(userIdentity))
            contractObject.tokens = await this.addStructuresToTokenList(contractObject.tokens)
            return contractObject
        }
    }

    async getContractTokens(contractAddress, byPlain = false){
        const userIdentity = ConnectionStore.getUserIdentity()
        const {api} = Networks.getSettings(ConnectionStore.getNetwork().name)
        if(api && !byPlain && +process.env.VUE_APP_OPENSEA_PROVIDER){
            console.log('getting tokens by API', contractAddress)
            try{
                let tokens = await API.fetchUserTokensByContract(contractAddress, userIdentity)
                tokens = tokens.map(token => {
                    return Formatters.tokenFormat({
                        id: token.token_id,
                        contractAddress: contractAddress,
                        name: token.name,
                        image: token.image_url,
                        description: token.description,
                        link: token.permalink
                    })
                })

                return await this.addStructuresToTokenList(tokens)
            }
            catch (e){
                console.log('getContractObject by API error', e)
                return await this.getContractTokens(contractAddress, true)
            }
        }
        else {
            console.log('getting tokens by plain', contractAddress)
            const contract = new SmartContract({
                address: contractAddress,
                type: 'bundle'
            })

            const tokens = await contract.fetchTokensForUser(userIdentity)
            // console.warn('tokens return', tokens);
            return await this.addStructuresToTokenList(tokens)
        }
    }

    async checkForENSName(address){
        if(ethers.utils.isAddress(address)){
            return {
                realAddress: address,
                ensName: address
            }
        }
        else{
            let realAddress;
            try{
                realAddress = await ConnectionStore.getProviderForENS().resolveName(address)
            }
            catch (e){
                log(e)
                throw new Error('CONTRACT_ADDRESS_ERROR')
            }
            if(realAddress && ethers.utils.isAddress(realAddress)){
                return {
                    realAddress: realAddress,
                    ensName: address
                }
            }
            else {
                throw new Error('CONTRACT_ADDRESS_ERROR')
            }
        }
    }

    async sendNFT(tokenObject, toAddressPlain) {
        console.log('sendNFT', tokenObject, toAddressPlain);

        const {realAddress: toAddress} = await this.checkForENSName(toAddressPlain)
        const [contractAddress, tokenID] = tokenObject.identity.split(':')
        const fromAddress = ConnectionStore.getUserIdentity()
        if(stringCompare(fromAddress, toAddress)) throw Error('THE_SAME_ADDRESS_ERROR')

        console.log(`[Send NFT] contract: ${contractAddress}, token: ${tokenID}, from: ${fromAddress}, to: ${toAddress}`)

        const Contract = new SmartContract({
            address: contractAddress
        })
        return await Contract.sendToken(tokenID, fromAddress, toAddress)
    }


    tryToConnectToUnsupportedNetwork(){
        console.log('network not supported')
        alert.open('Sorry, we did not support this network')
    }

}

export default EVM