export default {
    storeName: 'custom_contracts',
    getAll(){
        let contracts = {}
        const contractsRaw = localStorage.getItem(this.storeName) || '{}'
        try{
            contracts = JSON.parse(contractsRaw)
        }
        catch (e){
            console.log('[custom contracts] decode error', e, contractsRaw)
        }
        return contracts
    },
    async get(name){
        const contracts = this.getAll()
        return contracts[name] || []
    },
    async add(contract, networkName) {
        const contracts = this.getAll()
        console.log('[custom contracts] current contracts', contracts);
        contracts[networkName] = contracts[networkName] || []
        if(!contracts[networkName].includes(contract)) contracts[networkName].push(contract)
        try{
            let json = JSON.stringify(contracts)
            localStorage.setItem(this.storeName, json)
            console.log('[custom contracts] added', contract)
        }
        catch (e){
            console.log('[custom contracts] encode error', e, contract, contracts)
        }
    },
    async remove(contract, networkName){
        const contracts = this.getAll()
        contracts[networkName] = contracts[networkName] || []
        contracts[networkName] = contracts[networkName].filter(c => c !== contract)
        try{
            let json = JSON.stringify(contracts)
            localStorage.setItem(this.storeName, json)
            console.log('[custom contracts] removed', contract)
        }
        catch (e){
            console.log('[custom contracts] encode error', e, contract, contracts)
        }
    }
}