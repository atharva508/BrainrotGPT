const cannedResponses = [
    "That's a great question! Let me think about that... Actually, the answer is quite simple when you break it down.",
    "I understand what you're asking. Based on my training, I would suggest considering multiple perspectives here.",
    "Interesting point! Here's what I think: the key is to approach this systematically and methodically.",
    "Thanks for asking! This is actually a topic I find fascinating. Let me share some thoughts...",
    "Great question! The short answer is: it depends. But let me give you a more detailed explanation.",
    "I appreciate you bringing this up. From what I understand, there are several factors to consider.",
    "That's something many people wonder about! Here's my take on it based on the information available.",
    "Excellent question! Let me break this down into smaller, more manageable pieces for you.",
    "I see what you're getting at. The answer involves understanding a few key concepts first.",
    "Thanks for the thoughtful question! Here's a comprehensive response that should help clarify things."
];

export class MockGptService {
    async getResponse(userMessage: string): Promise<string> {
        // Random delay between 3-8 seconds
        const delay = Math.floor(Math.random() * 5000) + 3000;

        await new Promise(resolve => setTimeout(resolve, delay));

        // Return a random canned response
        const randomIndex = Math.floor(Math.random() * cannedResponses.length);
        return cannedResponses[randomIndex];
    }
}
