import { ethers, Contract } from "ethers";
import {stringCompare} from "@/utils/string";
import ledgerService from "@ledgerhq/hw-app-eth/lib/services/ledger";
import {log} from "@/utils/AppLogger";
import Web3 from 'web3';

import {    
    LimitOrderBuilder,    
    LimitOrderProtocolFacade,    
    Web3ProviderConnector,
} from '@1inch/limit-order-protocol';

import {
    DecentralizedStorage,
    Formatters,
    AppStorage,
    Networks,
    ConnectionStore,
    ErrorList,
    TokensABI,
    TokenRoles,
    ActionTypes
} from '@/crypto/helpers'


class SmartContract {

    _address = null
    _type = null

    //  ethers contract instance
    _instance = null
    _provider = null

    metaData = {
        address: null,
        name: null,
        symbol: null,
        tokens: [],
        balance: 0
    }

    /*
    * @param options: object, address = string in hex, type = 'common' || 'bundle' || 'allowList'
    * */
    constructor({address, type = 'common'}){
        this._address = address
        this._type = type
        this.metaData.address = address
    }

    async getObjectForUser(userIdentity){
        log(`[SmartContract] get contract: ${this._address}, for user: ${userIdentity}`)
        await this.fetchMetadata()
        await this.fetchUserBalance(userIdentity)
        await this.fetchTokensForUser(userIdentity)
        return this.metaData
    }

    async fetchMetadata(){
        const Contract = await this._getInstance()
        try{
            this.metaData.name = await Contract.name()
            this.metaData.symbol = await Contract.symbol() || ''
        }
        catch (e){
            log('[SmartContract] Error get contract meta from contract ' + this._address, e);
        }
    }

    async fetchUserBalance(userIdentity){
        // @todo change for real call
        //return 100
        let abi = TokensABI.default.ABI
        let address = Networks.getSettings(ConnectionStore.getNetwork().name).tokenAddress
        const contract = new Contract(address, abi, this._getProvider())
        console.log("user identity"+ userIdentity)
        try {
            
            this.metaData.balance = Number(await contract.balanceOf(userIdentity))
        }
        catch (e) {
            log(`[SmartContract] Error get user balance for contract ${this._address}`, e);
        }
        return this.metaData.balance
    }

    async formHandler(amount, address){
        //const Contract = await this._getInstance()
        //await this.makeLimitOrder(address, amount)
       // await this.makeLimitOrder_test()
       console.log('approving erc20 transfer');

    //    const signture = await this.approve(amount)
    //    console.log(signature)

       console.log('creating limit order')
       //await this.makeLimitOrder(address, amount)
       await this.makeLimitOrder_test()

    }




    async fetchTokensForUser(userIdentity){
        const Contract = await this._getInstance()
        const balance = this.metaData.balance || await this.fetchUserBalance(userIdentity)

        try{
            // todo get balance of erc20 tokens
            //  get token ids
            let arrayOfTokens = await Promise.all([...new Array(balance)].map((_, index) => Contract.tokenOfOwnerByIndex(userIdentity, index)))
            log('[SmartContract] plain token ids', arrayOfTokens);
            // console.warn('--0002', arrayOfTokens)

            //  convert them into string

            log('[SmartContract] computed tokens meta data', arrayOfTokens);

            this.metaData.tokens = []
        }
        catch (e) {
            console.log('eeee', e)
            log('[SmartContract] Error in fetchTokensForUser', e, Contract);
        }

        return this.metaData.tokens
    }

    async makeLimitOrder_test(){
        const provider = await this._getProvider()
        const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6';
        const walletAddress = '0xB9f48fd8fdA9c353a61c34AC9F2feA35A9AB3eeA';
        const chainId = 1;

        const web3 = new Web3('https://mainnet.infura.io/v3/6c3a9507f03a49589e3cb762331f2026');
        console.log(provider)
        // You can create and use a custom provider connector (for example: ethers)
        const connector = new Web3ProviderConnector(web3);
        console.log(connector)

        const connector2 = new Web3ProviderConnector(web3);
        console.log(connector)
        
        const limitOrderBuilder = new LimitOrderBuilder(    
            contractAddress,    
            chainId,    
            provider);
        // const limitOrderProtocolFacade = new LimitOrderProtocolFacade(    
        //     contractAddress,    
        //     connector);
        // Create a limit order and it's signature
        const limitOrder = limitOrderBuilder.buildLimitOrder({    
            makerAssetAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',    
            takerAssetAddress: '0x111111111117dc0aa78b770fa6a738034120c302',    
            makerAddress: walletAddress,    
            makerAmount: '100',    
            takerAmount: '200',    
            predicate: '0x',    
            permit: '0x',    
            interaction: '0x',});
        
        const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(limitOrder);
        const limitOrderSignature = limitOrderBuilder.buildOrderSignature(walletAddress, limitOrderTypedData);
    }

    async makeLimitOrder(fromAddress, amount){
        try{
            const provider = await this._getProvider()
            const limitOrderAddress = Networks.getSettings(ConnectionStore.getNetwork().name).limitOrderAddress
            let tokenAddress = Networks.getSettings(ConnectionStore.getNetwork().name).tokenAddress

            console.log("tokenAddress", tokenAddress)
            console.log("provider",provider)
            const limitOrderBuilder = new LimitOrderBuilder(
                limitOrderAddress,    
                ConnectionStore.getNetwork().chainId,    
                provider); 
            console.log("limitOrderBuilder", limitOrderBuilder)
            const limitOrderProtocolFacade = new LimitOrderProtocolFacade(   
                 limitOrderAddress,    
                 provider);
            console.log("limitOrderProtocolFacade", limitOrderProtocolFacade)
            // Create a limit order and it's signature
            const limitOrder = limitOrderBuilder.buildLimitOrder({ 
                   makerAssetAddress: tokenAddress,
                   takerAssetAddress: tokenAddress,    
                   makerAddress: fromAddress,    
                   makerAmount: amount,    
                   takerAmount: amount,    
                   predicate: '0x',    
                   permit: '0x',    
                   interaction: '0x',
                });
            console.log("limitOrder",limitOrder)
            const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(limitOrder);
            console.log("limitOrderTypedData",limitOrderTypedData)
            const limitOrderSignature = limitOrderBuilder.buildOrderSignature(walletAddress, limitOrderTypedData);

            // Create a call data for fill the limit order
            // const callData = limitOrderProtocolFacade.fillLimitOrder(    
            //     limitOrder,    
            //     limitOrderSignature,    
            //     '100',    
            //     '0',    
            //     '50'
            //     );
            console.log("limitOrderSignature",limitOrderSignature)
        }
        catch (e){
            console.log('makeLimitOrder error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }


    async sendToken(tokenID, fromAddress, toAddress){
        try{
            const Contract = await this._getInstance()
            const transactionResult = await Contract['safeTransferFrom(address,address,uint256)'](fromAddress, toAddress, tokenID)
            return await transactionResult.wait()
        }
        catch (e){
            log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async approveTokenList(tokenList, setProcessStatus = null){
        for await (const identityForApplying of tokenList){
            if(typeof setProcessStatus === 'function') setProcessStatus(ActionTypes.approving_token, identityForApplying.tokenId)
            const contract = new this.constructor({
                address: identityForApplying.token
            })
            await contract.approve(this._address, identityForApplying.tokenId)
        }
        return true
    }
    
    async approve(amount){
        let tokenAddress = Networks.getSettings(ConnectionStore.getNetwork().name).tokenAddress
        const limitOrderAddress = Networks.getSettings(ConnectionStore.getNetwork().name).limitOrderAddress

        let abi = TokensABI.default.ABI
        let provide = ConnectionStore.getProvider();
        const contract = new Contract(tokenAddress, abi, provide)

        try{
            console.log(amount)
            const tx = await contract.approve(limitOrderAddress, amount)
            return await tx.sign()
        }
        catch (e){
            console.log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    /*
    * @param tokensForBundle: Array<{token: contractAddress, tokenId}>
    * @param bundleDataCID: String from object {...meta, ...tokensInBundleDetails, image: bundleImage}, (bundleImage like: https://ipfs.io/Qm...)
    * */
    async makeBundle(tokensForBundle, bundleDataCID, setProcessStatus){
        const Contract = await this._getInstance()

        //  approve all tokens
        await this.approveTokenList(tokensForBundle, setProcessStatus)

        setProcessStatus(ActionTypes.minting_bundle)

        try{
            const transactionResult = await Contract.bundleWithTokenURI(tokensForBundle, `ipfs://${bundleDataCID}`)
            return await transactionResult.wait()
        }
        catch (e){
            log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async mint(userIdentity, metaCID){
        const Contract = await this._getInstance()
        const {gasLimit} = Networks.getData(ConnectionStore.getNetwork().name)
        try{
            // const transactionResult = await Contract.mintItem(userIdentity, metaCID, {gasLimit})
            const transactionResult = await Contract['mintItem(address,string)'](userIdentity, metaCID)
            log(transactionResult)
            return await transactionResult.wait()
        }
        catch (e){
            console.log('mint error', e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }



    async getTotalSupply(){
        try{
            return Number(await this.callWithoutSign('totalSupply'))
        }
        catch (e) {
            log('getTotalSupply error', e)
            return 0
        }
    }

    async callWithoutSign(method, ...args){
        const Contract = await this._getInstance()
        try{
            return await Contract[method](...args)
        }
        catch (e){
            log(`callWithoutSign ${method} error`, e);
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    /*
    * General definition of interact with contract methods
    * */
    async callMethod(method, ...args){
        log(`callMethod ${method}`, args);
        const Contract = await this._getInstance()
        try{
            const transactionResult = await Contract[method](...args)
            return await transactionResult.wait()
        }
        catch (e){
            log(`callMethod ${method} error`, e);
            if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    async removeFromBundle(fromTokenID, tokenList, resultTokenCID){
        console.log('removeFromBundle', this._address, arguments);
        return await this.callMethod('removeNFTsFromBundle', fromTokenID, tokenList, resultTokenCID)
    }

    async addToBundle(addToTokenID, tokenList, resultTokenCID){
        return await this.callMethod('addNFTsToBundle', addToTokenID, tokenList, resultTokenCID)
    }

    /*  Only for Ledger  */
    async approveTokenListPlain(ethApp, tokenIdentityList, setProcessStatus){
        for await (const tokenIdentity of tokenIdentityList){
            const [contractAddress, tokenID] = tokenIdentity.split(':')

            const contract = new this.constructor({
                address: contractAddress
            })

            const plainContract = await contract._getInstance()

            const approvedFor = await plainContract.getApproved(tokenID)
            if(approvedFor && stringCompare(approvedFor, this._address)) {
                log(`token ${tokenIdentity} is already approving`)
                continue
            }

            setProcessStatus(ActionTypes.approving_token, tokenID)

            log(`try to approve token ${tokenIdentity}`)
            const trx = await contract.makePlainTransaction(ethApp, 'approve', this._address, tokenID)
            log('approving result', trx);
        }
    }

    /*  Only for Ledger  */
    async makePlainTransaction(ethApp, method, ...args){
        log(`makePlainTransaction, method: ${method}, args:`, args)
        const contract = await this._getInstance()
        const provider = this._getProvider()
        const store = AppStorage.getStore()

        try{
            store.setProcessStatus(ActionTypes.need_a_sign)

            const { data } = await contract.populateTransaction[method](...args)
            const nonce = await provider.getTransactionCount(ConnectionStore.getUserIdentity(), 'latest')

            const unsignedTx = {
                to: this._address,
                gasPrice: (await provider.getGasPrice())._hex,
                gasLimit: ethers.utils.hexlify(1000000),
                nonce,
                chainId: ConnectionStore.getNetwork().id,
                data
            }

            const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

            const resolution = await ledgerService.resolveTransaction(serializedTx, {}, {nft: true});
            const signature = await ethApp.signTransaction(
                "44'/60'/0'/0/0",
                serializedTx,
                resolution
            );
            signature.r = "0x"+signature.r;
            signature.s = "0x"+signature.s;
            signature.v = parseInt("0x"+signature.v);
            signature.from = this._address;

            const signedTx = ethers.utils.serializeTransaction(unsignedTx, signature);

            const trnSend = await provider.sendTransaction(signedTx);

            store.setProcessStatus(ActionTypes.wait_transaction_result)

            log('trnSend', trnSend);
            const trnResult = await trnSend.wait()
            log('trnResult', trnResult);

            return trnResult
        }
        catch (e) {
            log(e);
            if(e.name === 'EthAppPleaseEnableContractData'){
                console.warn(e.message)
                throw Error(ErrorList.TURN_ON_BLIND_SIGN)
            }
            else if(e.statusText === 'CONDITIONS_OF_USE_NOT_SATISFIED'){
                throw Error(ErrorList.USER_REJECTED_TRANSACTION)
            }
            throw Error(ErrorList.TRN_COMPLETE)
        }
    }

    // async approve(forAddress, tokenID){
    //     const Contract = await this._getInstance()
    //     const approvedFor = await Contract.getApproved(tokenID)
    //     if(approvedFor && stringCompare(approvedFor, forAddress)) return
    //     try{
    //         const tx = await Contract.approve(forAddress, tokenID)
    //         return await tx.wait()
    //     }
    //     catch (e){
    //         log('mint error', e);
    //         if(e.code === 4001) throw Error(ErrorList.USER_REJECTED_TRANSACTION)
    //         throw Error(ErrorList.TRN_COMPLETE)
    //     }
    // }


    async getWhiteListContracts(withMeta = false){
        const Contract = await this._getInstance()
        const contractsArray = await Contract.getEffectInfos() || []
        const returnList = [];
        for await (const item of contractsArray){
            const obj = {
                contractAddress: item.modificatorsContract,
                serverUrl: item.serverUrl,
                owner: item.owner,
                onlyFor: Number(item.originalContract) && item.originalContract || null
            }
            if(withMeta){
                const tempContract = new this.constructor({
                    address: item.modificatorsContract
                })
                const {name, symbol} = await tempContract.fetchMetadata()
                const totalSupply = await tempContract.getTotalSupply()
                obj.meta = {
                    name,
                    symbol,
                    totalSupply
                }
            }
            returnList.push(obj)
        }
        return returnList
    }

    async addContractToWhiteList({contractAddress, serverUrl, owner, onlyFor}){
        if(!onlyFor) onlyFor = '0x'+'0'.repeat(40)
        return await this.callMethod('addToList', {
            modificatorsContract: contractAddress,
            serverUrl,
            owner,
            originalContract: onlyFor
        })

    }

    async removeContractFromWhiteList(contractAddress){
        return await this.callMethod('removeFromList', contractAddress)
    }

    /*
    * @param applyToContract, modifyWithContract: String - contractAddress
    * */
    async checkApplyEffect(applyToContract, modifyWithContract){
        const Contract = await this._getInstance()
        return await Contract.checkPermission(applyToContract, modifyWithContract)
    }

    async _getInstance(){
        if(!this._instance){
            this._instance = await new Promise( async (resolve) => {
                let abi = TokensABI.default.ABI
                console.log()
                if(this._address == null)
                    this._address = Networks.getSettings(ConnectionStore.getNetwork().name).tokenAddress
                const contract = new Contract(this._address, abi, this._getProvider())
                resolve(contract)
            })
        }
        return this._instance
    }

    _getProvider(){
        if(!this._provider) this._provider = ConnectionStore.getProvider();
        return this._provider
    }

}

export default SmartContract