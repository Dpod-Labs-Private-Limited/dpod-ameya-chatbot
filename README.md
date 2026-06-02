# Ameya Analytics API — Integration Guide

A comprehensive reference for integrating with the **Ameya Analytics Platform**, covering authentication, dataset management, real-time chat streaming, and session lifecycle management.

# Account Detail
account_id : "a142e93d-7ce5-4fb5-bbd1-616378bfebb0"
subscriber_id : "d5da89b3-a81f-4498-b95b-ddbedf1305e3"
subscription_id : "0c85bda2-f4a0-4e79-b0b9-4a881ae2450a"
schema_id : "ameya_appflyte"

## Base URLs
Backend_URL: "https://appflyte-backend.smartfoodsafe.net"  # sfs-qat
Analytics_URL: "https://api.ameya.smartfoodsafe.net/ameya/analytics/v1" # sfs-qat


### 1. GET App Config
    Method: GET
    Base URL: Backend_URL
    Path: /api/ameya/{account_id}/{subscriber_id}/{subscription_id}/{schema_id}/{app_id}/get_app_details

### 2. Generate Agent User Token
Generates authentication token for an agent user. This token must be obtained before making any calls to the Analytics API.
    Method: POST
    Base URL: Backend_URL
    Path: /api/ameya/account/{account_id}/subscriber/{subscriber_id}/subscription/{subscription_id}/schema/{schema_id}/agent_user_token

    Path Parameters:
    account_id: string
    subscriber_id: string
    subscription_id: string
    schema_id: string

    Request Body

    ```json
    {
    "agen_api_token": "<your_agent_api_token>",
    "user_id": "<user_id>"
    }
    ```

    Response

    ```json
    {
        "token_id": "<generated_token>"
    }
    ```

### 3. Fetch Datasets

Retrieves the list of datasets available to the authenticated subscriber. Use the returned dataset metadata when submitting a query.

    Method: GET
    Base URL: Analytics_URL
    Path: /ameya/analytics/v1/subscriber/{subscriber_id}/subscription/{subscription_id}/function/user-management/event-get-list-of-data-sets

    Response: 
    Returns an array of dataset objects. Each object includes the fields used in the Chat endpoint (`dataset_name`, `dataset_id`, `dataset_type`).

    ```json
    [{
        "dataset_id": "<id>",
        "dataset_name": "<name>",
        "dataset_type": "<type>"
    }]
    ```


### 4. Chat

The chat flow is split into two steps: **submit** the query to receive identifiers, then **stream** the response using those identifiers.

---

#### 4.1 Submit Query

Submits a natural language question against a selected dataset. Returns a `session_id` and `correlation_id` used to stream the response.

    Method: POST
    Base URL: Analytics_URL
    Path: /ameya/analytics/v1/subscriber/{subscriber_id}/subscription/{subscription_id}/function/query-engine/event/query

    Request Body:

        ```json
        {
        "user_query": "What were total sales last quarter?",
        "session_id": null,
        "dataset_name": "<dataset_name>",
        "dataset_id": "<dataset_id>",
        "dataset_type": "<dataset_type>",
        "realm": {},
        "priority": 10,
        "mode": "<think_mode>",
        "app_id": "<app_id>"
        }
        ```

    user_query: string | The natural language question to ask 
    session_id: string | null |Pass `null` for the first message; use the returned `session_id` for all follow-up messages in the same conversation 
    dataset_name: string |Name of the target dataset (from Datasets response) 
    dataset_id: string | ID of the target dataset (from Datasets response) 
    dataset_type: string | Type of the target dataset (from Datasets response) 
    realm: object |Contextual realm configuration; pass `{}` if not required 
    priority: integer | Query priority level (default: `10`) 
    mode: bool | Processing mode / think status flag 
    app_id: string |Identifier of the calling application 

    Response

    ```json
    {
        "session_id": "<session_id>",
        "correlation_id": "<correlation_id>"
    }
    ```

#### 4.2 Stream Response

Opens a Server-Sent Events (SSE) stream that delivers the response for a submitted query in real time. Call this immediately after receiving the `correlation_id` from step 3.1.

    Method: GET
    Base URL: Analytics_URL
    Path: ameya/analytics/v1/subscriber/{subscriber_id}/subscription/{subscription_id}/function/query-engine/event/response-stream

    Query Parameters:
    correlation_id | string | Obtained from the Submit Query response 
    session_id | string | Obtained from the Submit Query response 
    user_message | string | The original user query text 

    Response:

    A stream of Server-Sent Events. Each event delivers a chunk of the response. Consume and render events incrementally for a real-time experience. The stream closes automatically when the response is complete.



### 5. Stop Message

Halts an in-progress streaming response. Use this when the user cancels a query or a timeout occurs.

    Method: GET
    Base URL: Analytics_URL
    Path: /ameya/analytics/v1/subscriber/{subscriber_id}/subscription/{subscription_id}/function/query-engine/event/stop-chat

    Query Parameters:
   correlation_id| string |The correlation ID of the query to stop 


### 6. Close Session

Terminates an active session and releases server-side resources. Call this when the user ends a conversation or navigates away.

    Method: DELETE
    Base URL: Analytics_URL
    Path: /ameya/analytics/v1/subscriber/{subscriber_id}/subscription/{subscription_id}/function/session-management/event/close-session

    Query Parameters:

    session_id| string | Session to terminate
    dataset_id| string | ID of the dataset used in the session
    dataset_type| string | Type of the dataset used in the session


#### 7. Logo URL
    Method: GET
    Base URL: Backend_URL
    Path: /api/appflyte_app/files/download-url?file_path=logo_url

