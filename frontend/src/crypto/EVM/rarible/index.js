import Evm from "@/crypto/EVM";
import RaribleConnector from "@/crypto/EVM/rarible/Connector";
import SmartContract from "@/crypto/EVM/SmartContract";
import {AppStorage} from "@/crypto/helpers";

import {ErrorList} from "@/crypto/helpers"
import {ActionTypes} from "@/crypto/helpers"

class Rarible extends Evm{

    // controllerClass = null
    connector = RaribleConnector

    constructor(){
        super()
    }

}

export default Rarible