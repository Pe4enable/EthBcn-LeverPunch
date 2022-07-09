import {HTTP} from "@/utils/API";
import ConnectionStore from "@/crypto/helpers/ConnectionStore";
import {catToFixed, shortCat} from "@/utils/string";
import {Token} from "@/crypto/helpers";


export function transformIdentityToObject(identity){
    const [token, tokenId] = identity.split(':')
    return {token, tokenId}
}

export function transformIdentitiesToObjects(identitiesList){
    return identitiesList.map(transformIdentityToObject)
}

/*
* @param contract:Object
* @return string: '<contractName>:<contractAddress>'
* */
export function getContractShortDefinition(contract){
    return `${shortCat(contract.name)}:${catToFixed(contract.address)}`
}

/*
* @param token:Object
* @return string: '<tokenName>:<tokenID>'
* */
export function getTokenShortDefinition(token){
    const tokenID = (token.id.length > 4)? catToFixed(token.id) : token.id
    return `${shortCat(token.name)}:${tokenID}`
}