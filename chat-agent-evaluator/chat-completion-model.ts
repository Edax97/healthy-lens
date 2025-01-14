import {config} from "dotenv";
import OpenAI from "openai";
import {
    ChatCompletionToolMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionTool, ChatCompletionCreateParamsBase
} from "openai/resources/chat/completions";
import {ResponseFormatJSONSchema} from "openai/resources/shared";

export interface SourceData {
    url: string;
    title: string;
    journal: string;
    date: string;
    abstract: string;
    authors: string;
}

config();

const response_format: ResponseFormatJSONSchema = {
    "type": "json_schema",
    "json_schema": {
        "name": "medical_claim_validator",
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
                    "description": "The list of evaluations performed over the claims",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string",
                                "description": "The user defined claim id"
                            },
                            "validation": {
                                "type": "number",
                                "description": "Evaluation category from 1 to 4, in case of a claim not related to medical issues, return -1"
                            },
                            "summary": {
                                "type": "string",
                                "description": "Evaluation summary up to 25 words"
                            },
                            "detailed_review": {
                                "type": "string",
                                "description": "Argumentation and reasoning behind the validation result, up to 80 words"
                            },
                            "references": {
                                "type": "array",
                                "description": "The articles reviewed for the claim validation",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "citation": {
                                            "type": "string",
                                            "description": "Last and first name of main contributor et.al., (publication year)"
                                        },
                                        "resource_url": {
                                            "type": "string",
                                            "description": "Article url as provided by function results"
                                        }
                                    }
                                }

                            },
                            "topic": {
                                "type": "string",
                                "enum": [
                                    "Mental health",
                                    "Nutrition",
                                    "Neuroscience",
                                    "Public health",
                                    "Prevention",
                                    "Medicine",
                                    "Other"
                                ],
                                "description": "Main health-related topic referenced in the original claim"
                            }
                        },
                        "required": [
                            "id",
                            "validation",
                            "summary",
                            "detailed_review",
                            "topic",
                            "references",
                        ],
                        "additionalProperties": false
                    }
                }
            }
        }
    }
};

const tools: ChatCompletionTool[] = [
    {
        "type": "function",
        "function": {
            "name": "get_single_claim_sources",
            "description": "Get scientific sources to validate the claim",
            "parameters": {
                "type": "object",
                "properties": {
                    "search_term": {
                        "type": "string",
                        "description": "Terms to search for the claim provided, head the following criteria: first " +
                            "include the dimension of human health being addressed (in one or two words)" +
                            ", then the factor that influences over that dimension (up to two words)." +
                            "E.g. dopamine release cold  showers",
                    },
                    "topic": {
                        "type": "string",
                        "description": "Topic addressed by the original claim"
                    }
                },
                "additionalProperties": false,
                "required": [
                    "search_term",
                    "topic"
                ]
            },
            "strict": true
        }
    }
];

export const function_results_message = (sources: SourceData[], call_id: string): ChatCompletionToolMessageParam => ({
    "role": "tool",
    "content": sources.map(source => ({
            type: "text",
            text: JSON.stringify(source)
        }
    )),
    "tool_call_id": `${call_id}`
});

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const completion_definition = (messages: ChatCompletionMessageParam[], n: number): ChatCompletionCreateParamsBase => {
    return ({
        model: 'gpt-4o',
        messages: [
            {
                "role": "developer",
                "content": "You're an expert research assistant that checks the veracity of a list of medical claims, based on the information returned by the function get_single_claim_sources." +
                    "\n-  Only evaluate of falsifiable medical-related claims" +
                    "\n- Each claim will be an item inside the array provided by the user." +
                    "\n- Reference the contextual sources considered in your evaluations. " +
                    "\n-  Be rigorous but fair. Answer with \"Could not reach a veredict\" within summary field if it's not possible to reach a conclusion based on the provided document sources." +
                    "\n-  For each claim provided, generate an evaluation up to 100 words, a summary of such evaluation up to 25 words, and a validation score from 1 to 4 (greater is better). "
            },
            ...messages,
        ],
        response_format,
        tools,
        n,
        max_completion_tokens: 16000,
        temperature: 0.65
    })
};
