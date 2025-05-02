export default () => ({
    instagram: {
        webhookVerifyToken: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN,
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    },
    openRouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct',
        baseUrl: 'https://openrouter.ai/api/v1',
    },
    app: {
        port: process.env.PORT || 3000,
    },
}); 