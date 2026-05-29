import axios from "axios";
import { fetchAccountId, fetchSubscriberId, fetchSubscriptionId } from "../../utils/getAccountDetails";

class dpodService {


    constructor() {
        this.subscriber_id = null;
        this.subscription_id = null;
        this.account_id = null;
    }

    async initialize() {
        this.subscriber_id = await fetchSubscriberId();
        this.subscription_id = await fetchSubscriptionId();
        this.account_id = await fetchAccountId();
    }

    getBrandLogo = async (appflyte_backend_url, object_paths) => {
        try {
            await this.initialize();
            const request_url = `${appflyte_backend_url}/api/media/${this.account_id}/subscriber/${this.subscriber_id}/subscription/${this.subscription_id}/ameya-generate-download-url?bucket_name=dpod-aws-s3&object_paths=${object_paths}`
            const response = await axios.post(request_url)
            return response
        } catch (error) {
            console.log(error)
            return null
        }
    }

}

const brandLogoApi = new dpodService();
export default brandLogoApi;
