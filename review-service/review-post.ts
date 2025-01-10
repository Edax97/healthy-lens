import {filter_model_definition} from "../chat-agent-evaluator/filter-post-model";
import {
    ChatCompletionMessageParam,
    ChatCompletion
} from "openai/resources/chat/completions";
import {fetchSources} from "../chat-agent-evaluator/get_sources_call";
import {
    openai,
    function_results_message,
    completion_definition,
} from "../chat-agent-evaluator/chat-completion-model";
import {Post} from "../posts-service/user-scrapper";

interface ResponseReview {
    content: string;
    date: string;
    url: string;
    validation: number;
    summary: string;
    detailed_review: string;
    references: {
        citation: string;
        resource_url: string;
    }[];
    topic: string;
}

export const reviewPostBatch = async (
    posts: Post[], batch_items: number): Promise<ResponseReview[]> => {
    const filterResponse = await openai.chat
        .completions.create(filter_model_definition([
            {
                role: "user",
                content: JSON.stringify(posts)
            }
        ])) as ChatCompletion;
    const postsFiltered: Post[] = JSON.parse(filterResponse.choices[0].message.content).schema;
    if (!postsFiltered) return null;
    const user_messages: ChatCompletionMessageParam = {
        role: "user",
        content: JSON.stringify(postsFiltered.map(p =>
            ({claim: p.body, date: p.date, url: p.url})
        ))
    };
    const toolResponse = await openai.chat.completions
        .create(completion_definition([
            user_messages
        ], batch_items)) as ChatCompletion;
    const assistant_function_calls = [];
    const sources_params = toolResponse.choices.map((choice: ChatCompletion.Choice) => {
        if (!choice.message.tool_calls) return null;
        const {search_term} = JSON.parse(choice.message.tool_calls[0].function.arguments);
        if (!search_term) return null;
        assistant_function_calls.push(choice.message);
        return ({
            search_term,
            call_id: choice.message.tool_calls[0].id
        });
    }).filter(i => i !== null);
    // api to pmc europe
    const tool_messages = [];
    for await (const param of sources_params) {
        const post_context = await fetchSources(param.search_term, '');
        tool_messages.push(function_results_message(post_context, param.call_id));
    }
    const sources = await fetchSources('', '');

    // query completion model for analysis
    const reviewOfPosts = (await openai.chat.completions
        .create(completion_definition([
            user_messages,
            ...assistant_function_calls,
            ...tool_messages
        ], batch_items))) as ChatCompletion;
    const choices = reviewOfPosts.choices as ChatCompletion.Choice[];

    return choices.map<ResponseReview>((choice: ChatCompletion.Choice) => {
        const review = JSON.parse(choice.message.content) as ResponseReview;
        if (!review.validation) return null;
        return review;
    }).filter(i => i !== null);
}

export const reviewAllPosts = async (posts: Post[], batch_size: number): Promise<ResponseReview[]> => {
    const allReviews: ResponseReview[] = [];
    for (let i = 0; i < posts.length; i = i + batch_size) {
        const batch = posts.slice(0, i + batch_size);
        const reviews = await reviewPostBatch(batch, batch_size);
        allReviews.push(...reviews);
    }
    return allReviews;
}