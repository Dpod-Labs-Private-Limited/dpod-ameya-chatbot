import axios from 'axios';

class ConfigStoreService {

    async fetchAllConfig(config) {
        try {

            const appflyte_schema_id = config?.APPFLYTE_SCHEMA_ID ?? null
            const appflyte_account_id = config?.APPFLYTE_ACCOUNT_ID ?? null
            const appflyte_subscriber_id = config?.APPFLYTE_SUBSCRIBER_ID ?? null
            const appflyte_subscription_id = config?.APPFLYTE_SUBSCRIPTION_ID ?? null
            const config_file_name = config?.ANALYTICS_CONFIG_FILE_NAME ?? null
            const appflyte_backend_url = config?.APPFLYTE_BACKEND_BASE_URL ?? null

            const response = await axios.get(`${appflyte_backend_url}/api/media/${appflyte_account_id}/subscriber/${appflyte_subscriber_id}/subscription/${appflyte_subscription_id}/generate-upload-url?fileId=${config_file_name}`)
            if (response.status === 200) {
                const responseData = response?.data ?? []
                const download_url = responseData[responseData?.length - 1]?.download_url ?? null;
                const configData = await fetch(download_url);
                const responseJson = await configData.json() ?? {}
                return responseJson;
            }
        } catch (error) {
            return {}
        }
    }

}

const configStoreService = new ConfigStoreService();
export default configStoreService;
