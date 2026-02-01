import * as assert from 'assert';
import { AdService, MockAdProvider, Ad, AdCategory, IAdProvider } from '../../services/AdService';

suite('AdService Test Suite', () => {
    setup(() => {
        // Reset singleton instance before each test
        AdService.resetInstance();
    });

    suite('Singleton Pattern', () => {
        test('should return the same instance', () => {
            const instance1 = AdService.getInstance();
            const instance2 = AdService.getInstance();
            assert.strictEqual(instance1, instance2);
        });

        test('should reset instance correctly', () => {
            const instance1 = AdService.getInstance();
            AdService.resetInstance();
            const instance2 = AdService.getInstance();
            assert.notStrictEqual(instance1, instance2);
        });
    });

    suite('Ad Enable/Disable', () => {
        test('should be enabled by default', () => {
            const service = AdService.getInstance();
            assert.strictEqual(service.isEnabled(), true);
        });

        test('should disable ads correctly', () => {
            const service = AdService.getInstance();
            service.setEnabled(false);
            assert.strictEqual(service.isEnabled(), false);
        });

        test('should enable ads correctly', () => {
            const service = AdService.getInstance();
            service.setEnabled(false);
            service.setEnabled(true);
            assert.strictEqual(service.isEnabled(), true);
        });

        test('should return null when ads are disabled', async () => {
            const service = AdService.getInstance();
            service.setEnabled(false);
            const ad = await service.getRandomAd();
            assert.strictEqual(ad, null);
        });

        test('should return null for category ad when disabled', async () => {
            const service = AdService.getInstance();
            service.setEnabled(false);
            const ad = await service.getAdByCategory('software');
            assert.strictEqual(ad, null);
        });
    });

    suite('Get Random Ad', () => {
        test('should return an ad when enabled', async () => {
            const service = AdService.getInstance();
            const ad = await service.getRandomAd();
            assert.ok(ad !== null);
            assert.ok(ad!.id);
            assert.ok(ad!.title);
            assert.ok(ad!.description);
        });

        test('should return ad with all required properties', async () => {
            const service = AdService.getInstance();
            const ad = await service.getRandomAd();

            assert.ok(ad !== null);
            assert.strictEqual(typeof ad!.id, 'string');
            assert.strictEqual(typeof ad!.title, 'string');
            assert.strictEqual(typeof ad!.description, 'string');
            assert.strictEqual(typeof ad!.imageUrl, 'string');
            assert.strictEqual(typeof ad!.clickUrl, 'string');
            assert.strictEqual(typeof ad!.category, 'string');
        });
    });

    suite('Get Ad By Category', () => {
        test('should return software category ad', async () => {
            const service = AdService.getInstance();
            const ad = await service.getAdByCategory('software');
            assert.ok(ad !== null);
            assert.strictEqual(ad!.category, 'software');
        });

        test('should return hardware category ad', async () => {
            const service = AdService.getInstance();
            const ad = await service.getAdByCategory('hardware');
            assert.ok(ad !== null);
            assert.strictEqual(ad!.category, 'hardware');
        });

        test('should return learning category ad', async () => {
            const service = AdService.getInstance();
            const ad = await service.getAdByCategory('learning');
            assert.ok(ad !== null);
            assert.strictEqual(ad!.category, 'learning');
        });

        test('should return gaming category ad', async () => {
            const service = AdService.getInstance();
            const ad = await service.getAdByCategory('gaming');
            assert.ok(ad !== null);
            assert.strictEqual(ad!.category, 'gaming');
        });

        test('should return services category ad', async () => {
            const service = AdService.getInstance();
            const ad = await service.getAdByCategory('services');
            assert.ok(ad !== null);
            assert.strictEqual(ad!.category, 'services');
        });
    });

    suite('Get All Categories', () => {
        test('should return all 5 categories', () => {
            const service = AdService.getInstance();
            const categories = service.getAllCategories();

            assert.strictEqual(categories.length, 5);
            assert.ok(categories.includes('software'));
            assert.ok(categories.includes('hardware'));
            assert.ok(categories.includes('learning'));
            assert.ok(categories.includes('gaming'));
            assert.ok(categories.includes('services'));
        });
    });

    suite('Custom Provider', () => {
        test('should accept custom provider', async () => {
            const customAd: Ad = {
                id: 'custom-1',
                title: 'Custom Ad',
                description: 'Custom Description',
                imageUrl: 'https://example.com/image.png',
                clickUrl: 'https://example.com',
                category: 'software'
            };

            const customProvider: IAdProvider = {
                fetchAd: async () => customAd,
                fetchAdByCategory: async () => customAd
            };

            const service = AdService.getInstance();
            service.setProvider(customProvider);

            const ad = await service.getRandomAd();
            assert.strictEqual(ad!.id, 'custom-1');
            assert.strictEqual(ad!.title, 'Custom Ad');
        });
    });
});

suite('MockAdProvider Test Suite', () => {
    let provider: MockAdProvider;

    setup(() => {
        provider = new MockAdProvider();
    });

    suite('Fetch Ad', () => {
        test('should return an ad', async () => {
            const ad = await provider.fetchAd();
            assert.ok(ad);
            assert.ok(ad.id);
            assert.ok(ad.title);
        });

        test('should not return same ad twice in a row', async () => {
            // Run multiple times to ensure variety
            const ads: string[] = [];
            for (let i = 0; i < 20; i++) {
                const ad = await provider.fetchAd();
                if (ads.length > 0 && ads.length < 10) {
                    // With 10 ads, we shouldn't get same ad twice in a row
                    assert.notStrictEqual(
                        ad.id,
                        ads[ads.length - 1],
                        'Should not return same ad twice in a row'
                    );
                }
                ads.push(ad.id);
            }
        });
    });

    suite('Fetch Ad By Category', () => {
        test('should return ad of requested category', async () => {
            const categories: AdCategory[] = ['software', 'hardware', 'learning', 'gaming', 'services'];

            for (const category of categories) {
                const ad = await provider.fetchAdByCategory(category);
                assert.strictEqual(ad.category, category);
            }
        });
    });

    suite('Click Tracking', () => {
        test('should track ad clicks', () => {
            provider.trackClick('ad-1');
            const stats = provider.getClickStats();
            assert.strictEqual(stats.get('ad-1'), 1);
        });

        test('should increment click count', () => {
            provider.trackClick('ad-1');
            provider.trackClick('ad-1');
            provider.trackClick('ad-1');
            const stats = provider.getClickStats();
            assert.strictEqual(stats.get('ad-1'), 3);
        });

        test('should track multiple ads separately', () => {
            provider.trackClick('ad-1');
            provider.trackClick('ad-2');
            provider.trackClick('ad-1');

            const stats = provider.getClickStats();
            assert.strictEqual(stats.get('ad-1'), 2);
            assert.strictEqual(stats.get('ad-2'), 1);
        });

        test('should return copy of stats map', () => {
            provider.trackClick('ad-1');
            const stats1 = provider.getClickStats();
            stats1.set('ad-1', 100); // Modify the copy

            const stats2 = provider.getClickStats();
            assert.strictEqual(stats2.get('ad-1'), 1); // Original should be unchanged
        });
    });

    suite('Ad Properties', () => {
        test('should have valid promo codes', async () => {
            const ad = await provider.fetchAd();
            if (ad.promoCode) {
                assert.strictEqual(typeof ad.promoCode, 'string');
                assert.ok(ad.promoCode.length > 0);
            }
        });

        test('should have valid image URLs', async () => {
            const ad = await provider.fetchAd();
            assert.ok(ad.imageUrl.startsWith('https://'));
        });

        test('should have valid category', async () => {
            const validCategories: AdCategory[] = ['software', 'hardware', 'learning', 'gaming', 'services'];
            const ad = await provider.fetchAd();
            assert.ok(validCategories.includes(ad.category));
        });
    });
});
