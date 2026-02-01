import * as assert from 'assert';
import { MockGptService } from '../../services/MockGptService';

suite('MockGptService Test Suite', () => {
    let service: MockGptService;

    setup(() => {
        service = new MockGptService();
    });

    test('should return a string response', async () => {
        const response = await service.getResponse('Hello');
        assert.strictEqual(typeof response, 'string');
        assert.ok(response.length > 0, 'Response should not be empty');
    });

    test('should return one of the canned responses', async () => {
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

        const response = await service.getResponse('Test message');
        assert.ok(
            cannedResponses.includes(response),
            `Response "${response}" should be one of the canned responses`
        );
    });

    test('should handle different user messages', async () => {
        const responses = await Promise.all([
            service.getResponse('What is JavaScript?'),
            service.getResponse('How do I use React?'),
            service.getResponse('Explain TypeScript')
        ]);

        responses.forEach(response => {
            assert.strictEqual(typeof response, 'string');
            assert.ok(response.length > 0);
        });
    });

    test('should handle empty user message', async () => {
        const response = await service.getResponse('');
        assert.strictEqual(typeof response, 'string');
        assert.ok(response.length > 0, 'Should return a response even for empty input');
    });

    test('should handle special characters in user message', async () => {
        const response = await service.getResponse('Hello! @#$%^&*() 你好');
        assert.strictEqual(typeof response, 'string');
        assert.ok(response.length > 0);
    });
});
