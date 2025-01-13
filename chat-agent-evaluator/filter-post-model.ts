import {config} from "dotenv";
import {
    ChatCompletionMessageParam,
    ChatCompletionCreateParamsBase
} from "openai/resources/chat/completions";
import {ResponseFormatJSONSchema} from "openai/resources/shared";

config();

const response_format: ResponseFormatJSONSchema = {
    "type": "json_schema",
    "json_schema": {
        "name": "health-post-selector",
        "schema": {
            "type": "object",
            "required": [
                "name",
                "strict",
                "schema"
            ],
            "properties": {
                "name": {
                    "type": "string",
                    "description": "The name of the schema"
                },
                "strict": true,
                "schema": {
                    "type": "array",
                    "description": "Selected posts that contain falsifiable medical claims",
                    "items": {
                        "type": "object",
                        "properties": {
                            "claim": {
                                "type": "string",
                                "description": "A conservative summary of the original claim, at most 50 words"
                            },
                            "date": {
                                "type": "string",
                                "description": "Date of the claim, provided by the user"
                            },
                            "url": {
                                "type": "string",
                                "description": "URL of the claim original post, provided by the user"
                            },
                        },
                        "required": [
                            "claim",
                            "date",
                            "url"
                        ],
                        "additionalProperties": false
                    }
                }
            }
        }
    }
};

export const filter_model_definition
    = (messages: ChatCompletionMessageParam[]): ChatCompletionCreateParamsBase => {
    return ({
        model: 'gpt-4o',
        messages: [
            {
                "role": "developer",
                "content": "You are a helpful assistant that filters a list of posts provided by the user, " +
                    "selecting only and all the posts which contain affirmations that can be falsified" +
                    "and that verse about a health condition or dimension  q" +
                    "(whether accurate or not)"
            },
            ...messages
        ],
        response_format,
        max_completion_tokens: 16000,
        temperature: 0.35
    });
}
