import {config} from "dotenv";
import OpenAI from "openai";

config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You're an expert research assistant that checks the veracity of a list of medical claims, based on the information returned by the function get_single_claim_sources.\n-  Each claim will be an item inside the array provided by the user.\n- Reference the contextual sources considered in your evaluations. \n-  Be rigorous but fair. Answer with \"Could not reach a veredict\" within summary field if it's not possible to reach a conclusion based on the provided document sources.\n-  For each claim provided, generate an evaluation up to 80 words, a summary of such evaluation up to 25 words, and a validation score from 1 to 4 (greater is better). It's imperative you include evaluations for each user message.\n\n"
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "[{\n    date: '2022-01-22',\n    body: 'The major effect of testosterone on the brain (of both males and females) is to make effort feel good.',\n    url: 'https://example.com/post7'\n  },\n{\n    date: \"2022-01-22\",\n    body: \"There is something to doing challenging physical exercise (ideally in the early morning). It calibrates your autonomic system so that subsequent stressors of life have less of an impact. This is unlikely to be purely psychological. Calibrate your stress threshold. Every day.\",\n    url: \"https://example.com/post7\"\n  },\n{\n    date: \"2025-01-25\",\n    body: \"Research shows that ~90 min is the longest period we can expect to maintain intense focus and effort toward learning.\",\n    url: \"https://example.com/post7\"\n  },\n]"
                }
            ]
        },
        {
            "role": "assistant",
            "tool_calls": [
                {
                    "id": "call_FyUdsXSVJHaXl4zqXfkLXlYl",
                    "type": "function",
                    "function": {
                        "name": "get_single_claim_sources",
                        "arguments": "{\"topic\": \"Neuroscience\", \"search_term\": \"testosterone brain effect effort feel good\"}"
                    }
                },
                {
                    "id": "call_wtaBwpvag9JvzRZadPc3PGPF",
                    "type": "function",
                    "function": {
                        "name": "get_single_claim_sources",
                        "arguments": "{\"topic\": \"Neuroscience\", \"search_term\": \"physical exercise morning autonomic system stress threshold\"}"
                    }
                },
                {
                    "id": "call_RrkoClUjCb08dGnIvND49wOI",
                    "type": "function",
                    "function": {
                        "name": "get_single_claim_sources",
                        "arguments": "{\"topic\": \"Neuroscience\", \"search_term\": \"90 minutes intense focus effort learning\"}"
                    }
                }
            ]
        },
        {
            "role": "tool",
            "content": [
                {
                    "type": "text",
                    "text": "{\n  \"claim_sources\": [\n    {\n      \"title\": \"The Influence of Testosterone on Motivation and Reward\",\n      \"author\": \"Smith, J.\",\n      \"publication\": \"Journal of Neuroscience\",\n      \"year\": 2021,\n      \"summary\": \"This study investigates how testosterone modulates brain mechanisms related to motivation and reward, suggesting a complex relationship between testosterone levels and feelings of pleasure during effortful tasks.\"\n    },\n    {\n      \"title\": \"Hormonal Regulation of Effort-Related Decision Making\",\n      \"author\": \"Johnson, L., & Taylor, R.\",\n      \"publication\": \"Endocrine Reviews\",\n      \"year\": 2020,\n      \"summary\": \"The authors review evidence that testosterone influences decision-making related to effort and reward, with implications for understanding emotional well-being.\"\n    },\n    {\n      \"title\": \"Testosterone and its Impact on Cognitive and Emotional Function\",\n      \"author\": \"Lee, M. et al.\",\n      \"publication\": \"Neuroscience & Biobehavioral Reviews\",\n      \"year\": 2019,\n      \"summary\": \"This article explores the effects of testosterone on cognitive functions and emotional states, highlighting the hormone's role in enhancing reward-driven behavior.\"\n    }\n  ]\n}"
                }
            ],
            "tool_call_id": "call_FyUdsXSVJHaXl4zqXfkLXlYl"
        },
        {
            "role": "tool",
            "content": [
                {
                    "type": "text",
                    "text": "{\n  \"claim_sources\": [\n    {\n      \"title\": \"The Influence of Physical Exercise on the Autonomic Nervous System\",\n      \"authors\": [\"Smith, J.\", \"Doe, A.\"],\n      \"journal\": \"Journal of Neuroscience Research\",\n      \"year\": 2021,\n      \"link\": \"https://example.com/article1\",\n      \"summary\": \"This study examines how morning physical exercise affects the autonomic nervous system and its role in managing stress thresholds.\"\n    },\n    {\n      \"title\": \"Morning Exercise and Stress Response in Humans\",\n      \"authors\": [\"Johnson, L.\", \"Lee, M.\"],\n      \"journal\": \"Physiology and Behavior\",\n      \"year\": 2020,\n      \"link\": \"https://example.com/article2\",\n      \"summary\": \"Research showing that engaging in physical activity in the morning can lower stress responses mediated by the autonomic system.\"\n    },\n    {\n      \"title\": \"Effects of Physical Activity on Autonomic Regulation\",\n      \"authors\": [\"Williams, R.\", \"Patel, K.\"],\n      \"journal\": \"International Journal of Environmental Research and Public Health\",\n      \"year\": 2022,\n      \"link\": \"https://example.com/article3\",\n      \"summary\": \"An analysis of how different types of morning physical exercise affect autonomic regulation concerning stress management.\"\n    }\n  ]\n}"
                }
            ],
            "tool_call_id": "call_wtaBwpvag9JvzRZadPc3PGPF"
        },
        {
            "role": "tool",
            "content": [
                {
                    "type": "text",
                    "text": "{\n  \"claim\": {\n    \"source\": \"American Psychological Association\",\n    \"title\": \"The Science of Learning: How Focused Learning Sessions Can Boost Retention\",\n    \"authors\": [\"John D. Smith\", \"Lisa A. Thompson\"],\n    \"publication_date\": \"2022-01-15\",\n    \"summary\": \"This research article discusses the effects of intensive learning sessions lasting approximately 90 minutes, highlighting the cognitive benefits and efficacy of focused effort in information retention.\",\n    \"link\": \"https://www.apa.org/science/learning/focused-learning\"\n  },\n  \"topic\": \"Neuroscience\",\n  \"search_term\": \"90 minutes intense focus effort learning\"\n}"
                }
            ],
            "tool_call_id": "call_RrkoClUjCb08dGnIvND49wOI"
        }
    ],
    response_format: {
        "type": "json_schema",
        "json_schema": {
            "name": "my_schema",
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
                    "schema": {
                        "type": "array",
                        "description": "Evaluations for each claim provided",
                        "items": {
                            "type": "object",
                            "required": [
                                "content",
                                "date",
                                "url",
                                "validation",
                                "summary",
                                "detailed_review",
                                "references",
                                "topic"
                            ],
                            "properties": {
                                "url": {
                                    "type": "string",
                                    "description": "URL of the claim original post, provided by the user"
                                },
                                "date": {
                                    "type": "string",
                                    "description": "Date of the claim, provided by the user"
                                },
                                "topic": {
                                    "enum": [
                                        "Mental health",
                                        "Nutrition",
                                        "Neuroscience",
                                        "Public health",
                                        "Prevention",
                                        "Medicine",
                                        "Other"
                                    ],
                                    "type": "string",
                                    "description": "Main health-related topic referenced in the original claim"
                                },
                                "content": {
                                    "type": "string",
                                    "description": "A conservative summary of the original claim, at most 50 words"
                                },
                                "summary": {
                                    "type": "string",
                                    "description": "Evaluation summary up to 25 words"
                                },
                                "references": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "required": [
                                            "citation",
                                            "resource_url"
                                        ],
                                        "properties": {
                                            "citation": {
                                                "type": "string",
                                                "description": "Last and first name of main contributor et.al., (publication year)"
                                            },
                                            "resource_url": {
                                                "type": "string",
                                                "description": "Article url as provided by function results"
                                            }
                                        },
                                        "additionalProperties": false
                                    },
                                    "description": "The articles reviewed for the claim validation"
                                },
                                "validation": {
                                    "type": "number",
                                    "description": "Evaluation category from 1 to 4, in case of a claim not related to medical issues, return -1"
                                },
                                "detailed_review": {
                                    "type": "string",
                                    "description": "Argumentation and reasoning behind the validation result, up to 80 words"
                                }
                            },
                            "additionalProperties": false
                        },
                        "strict": {
                            "type": "boolean"
                        }
                    },
                    "additionalProperties": false
                },
                "strict": true
            }
        },
    },
    tools: [
        {
            "type": "function",
            "function": {
                "name": "get_single_claim_sources",
                "strict": true,
                "parameters": {
                    "type": "object",
                    "required": [
                        "search_term",
                        "topic"
                    ],
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "Topic addressed by the original claim"
                        },
                        "search_term": {
                            "type": "string",
                            "description": "A list of key terms (up to 5) that summarize the claim provided, include the health-related factor that is being addressed"
                        }
                    },
                    "additionalProperties": false
                },
                "description": "Get scientific sources to validate the claim"
            }
        }
    ],
    tool_choice: "auto",
    temperature: 0.75,
    max_completion_tokens: 16000,
    frequency_penalty: 0,
    presence_penalty: 0
});
console.log(JSON.stringify(response));