import {
    ChatCompletionMessageParam,
    ChatCompletion, ChatCompletionMessage
} from "openai/resources/chat/completions";
import {CallArguments, fetchSources} from "../chat-agent-evaluator/get_sources_call";
import {
    openai,
    function_results_message,
    completion_definition,
} from "../chat-agent-evaluator/chat-completion-model";
import {Post} from "../posts-service/user-scrapper";

interface ResponseReview {
    id: number;
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
    posts: Post[], batch_index: number, batch_size: number): Promise<ResponseReview[]> => {
    const user_messages: ChatCompletionMessageParam = {
        role: "user",
        content: JSON.stringify(posts.map((p, i) =>
            ({
                claim: p.body, date: p.date,
                url: p.url, id: batch_index * batch_size + i
            })
        ))
    };
    const toolResponse = await openai.chat.completions
        .create(completion_definition([
            user_messages
        ], 1)) as ChatCompletion;
    const tool_message: ChatCompletionMessage = toolResponse.choices[0].message;
    const function_calls = tool_message.tool_calls.map(call => ({
        call_arguments: JSON.parse(call.function.arguments) as CallArguments,
        call_id: call.id
    })).filter(call => (call.call_arguments && call.call_arguments.search_term != ''));
    // api to pmc europe
    const function_messages = [];
    for await (const call of function_calls) {
        const post_context = await fetchSources(
            call.call_arguments.search_term, '');
        if (post_context) {
            function_messages.push(function_results_message(post_context, call.call_id));
        }
    }
    // query completion model for analysis
    const reviewOfPosts = (await openai.chat.completions
        .create(completion_definition([
            user_messages,
            tool_message,
            ...function_messages
        ], 1))) as ChatCompletion;
    const reviewContent = reviewOfPosts.choices[0].message.content;
    const reviewResponse = JSON.parse(reviewContent) as { "schema": ResponseReview[] };
    return reviewResponse.schema.filter(r => r?.validation);
}

export const reviewAllPosts = async (posts: Post[], batch_size: number): Promise<ResponseReview[]> => {
    //const allReviews: ResponseReview[] = [];
    const batchList = [];
    for (let i = 0; i < posts.length; i = i + batch_size) {
        const batch = posts.slice(0, i + batch_size);
        batchList.push(batch);
        //const reviews = await reviewPostBatch(batch);
        //allReviews.push(...reviews);
    }
    const allReviews = await Promise.all(batchList.map(((b, i) => reviewPostBatch(b, i, batch_size))))
    return allReviews.flat();
}