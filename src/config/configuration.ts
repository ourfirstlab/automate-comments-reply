export default () => ({
    instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        webhookVerifyToken: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN,
        username: process.env.INSTAGRAM_USERNAME,
        userId: process.env.INSTAGRAM_USER_ID,
    },
    openRouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct',
        baseUrl: 'https://openrouter.ai/api/v1',
    },
    app: {
        port: process.env.PORT || 3000,
    },
    mongodb: {
        uri: process.env.MONGODB_URI,
    },
}); 