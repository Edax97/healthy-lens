import {PostReviewed} from "../store/data-schema";

export const findTopTopics = (posts: PostReviewed[]): string => {
    const topicCount: { [key: string]: number } = {};
    const threshold = posts.length * 0.25;

    posts.forEach(post => {
        if (topicCount[post.topic]) {
            topicCount[post.topic]++;
        } else {
            topicCount[post.topic] = 1;
        }
    });

    const filteredTopics = Object.keys(topicCount)
        .filter(topic => topicCount[topic] > threshold)
        .sort((a, b) => topicCount[b] - topicCount[a]);

    return filteredTopics.slice(0, 3).join(',');
}
export const calculateAverageValidation = (posts: PostReviewed[]): number => {
    const totalValidation = posts.reduce((sum, post) => sum + post.validation, 0);
    return posts.length ? totalValidation / posts.length : 0;
}