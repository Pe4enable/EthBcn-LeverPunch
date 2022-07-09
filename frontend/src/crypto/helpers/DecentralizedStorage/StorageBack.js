import AppAPI, {HTTP} from "@/utils/API";
import {ErrorList} from '@/crypto/helpers'

export default {
    async save(file){
        const formData = new FormData();
        formData.append('payload', file);
        const result = await AppAPI.post('/ipfs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return result.data.split('://')[1]
    },

    /*
    * Put JSON to IPFS
    * @param {data} - js object
    * @return {string} cid
    * */
    async loadJSON(data = {}){
        try{
            let file = new Blob([JSON.stringify(data)], {type: 'application/json'});
            return await this.save(file)
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },

    /*
    * Put file to IPFS
    * @param {object} file - instance of Blob/File
    * @return {string} file_url
    * */
    async loadFile(file){
        try{
            const cid = await this.save(file)
            return `https://ipfs.io/ipfs/${cid}`;
        }
        catch (e){
            console.log('Error while loadingJSON to back', e)
            throw Error(ErrorList.LOAD_MEDIA_ERROR)
        }
    },

    async readData(url, timeout = 10000){
        let meta = null
        try{
            if(!url.startsWith('ipfs://') && !url.startsWith('http')) url = 'ipfs://'+url
            // const CID_RE = /Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}/m
            // let cid = CID_RE.exec(url)?.[0]
            let fetchURL = null
            if(url.startsWith('ipfs://')) fetchURL = `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`
            else if(url.startsWith('http')) fetchURL = url
            if(fetchURL){

                const fetchWithPlainRequest = async () => {
                    // let response = await axios.get(`https://ipfs.io/ipfs/${CID}`, {headers: {'accept': 'text/plain'}})
                    // let response = await axios.get(fetchURL, {headers: {'accept': 'text/plain'}})
                    const response = await HTTP.get(fetchURL, {headers: {'accept': 'application/json'}})
                    if(response.headers['content-type'].indexOf('application/json') !== -1 && response.data) {
                        meta = response.data
                    }
                }

                await fetchWithPlainRequest()
                /*const cid = fetchURL.split('ipfs/').pop()
                if(cid) {
                    try{
                        const response = await HttpAPI.get('/ipfs/cat', {
                            params: {
                                ipfs_addr: cid
                            }
                        })
                        meta = response.data
                    }
                    catch (e) {
                        console.log('Fetch ipfs object error', e)
                        await fetchWithPlainRequest()
                    }
                }
                else await fetchWithPlainRequest()*/
            }
        } catch (e) {
            meta = null
            if(e.message === 'Network Error'){
                throw e
            }
        }
        return meta
    }
}