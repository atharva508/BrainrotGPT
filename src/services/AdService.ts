/**
 * Ad Service - Mock Ad System for GPT Brainrot Extension
 *
 * This service provides a production-ready mock ad system that can be
 * swapped with real ad providers when policies allow.
 */

export interface Ad {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    promoCode?: string;
    clickUrl: string;
    category: AdCategory;
}

export type AdCategory = 'software' | 'hardware' | 'learning' | 'gaming' | 'services';

export interface IAdProvider {
    fetchAd(): Promise<Ad>;
    fetchAdByCategory(category: AdCategory): Promise<Ad>;
}

const mockAds: Ad[] = [
    {
        id: "ad-1",
        title: "GameDev Pro Suite",
        description: "Build games 10x faster!",
        promoCode: "BRAINROT50",
        imageUrl: "https://placehold.co/300x100/667eea/white?text=GameDev+Pro",
        clickUrl: "#",
        category: "software"
    },
    {
        id: "ad-2",
        title: "MechKeys Ultra",
        description: "The keyboard for elite coders",
        promoCode: "TYPEFASTER",
        imageUrl: "https://placehold.co/300x100/764ba2/white?text=MechKeys+Ultra",
        clickUrl: "#",
        category: "hardware"
    },
    {
        id: "ad-3",
        title: "CloudStack Pro",
        description: "Deploy in seconds, scale forever",
        promoCode: "CLOUD99",
        imageUrl: "https://placehold.co/300x100/11998e/white?text=CloudStack+Pro",
        clickUrl: "#",
        category: "services"
    },
    {
        id: "ad-4",
        title: "CodeMaster Academy",
        description: "From zero to hero in 30 days",
        promoCode: "LEARN2CODE",
        imageUrl: "https://placehold.co/300x100/fc4a1a/white?text=CodeMaster",
        clickUrl: "#",
        category: "learning"
    },
    {
        id: "ad-5",
        title: "RGB Everything Pro",
        description: "Your setup needs MORE lights",
        promoCode: "GLOW420",
        imageUrl: "https://placehold.co/300x100/f7971e/white?text=RGB+Pro",
        clickUrl: "#",
        category: "gaming"
    },
    {
        id: "ad-6",
        title: "UltraWide Monitor X",
        description: "49 inches of pure productivity",
        promoCode: "WIDEBOI",
        imageUrl: "https://placehold.co/300x100/00b4db/white?text=UltraWide+X",
        clickUrl: "#",
        category: "hardware"
    },
    {
        id: "ad-7",
        title: "AI Assistant Plus",
        description: "Your code, but smarter",
        promoCode: "SMARTCODE",
        imageUrl: "https://placehold.co/300x100/8e2de2/white?text=AI+Assistant",
        clickUrl: "#",
        category: "software"
    },
    {
        id: "ad-8",
        title: "DevOps Bootcamp",
        description: "CI/CD mastery awaits",
        promoCode: "PIPELINE",
        imageUrl: "https://placehold.co/300x100/ee0979/white?text=DevOps+Camp",
        clickUrl: "#",
        category: "learning"
    },
    {
        id: "ad-9",
        title: "Gaming Chair Deluxe",
        description: "Sit like a pro, code like a boss",
        promoCode: "SITPRO",
        imageUrl: "https://placehold.co/300x100/1a2980/white?text=Chair+Deluxe",
        clickUrl: "#",
        category: "gaming"
    },
    {
        id: "ad-10",
        title: "API Gateway Max",
        description: "Handle 1M requests/sec easily",
        promoCode: "APIPRO",
        imageUrl: "https://placehold.co/300x100/2c3e50/white?text=API+Gateway",
        clickUrl: "#",
        category: "services"
    }
];

export class MockAdProvider implements IAdProvider {
    private lastAdIndex: number = -1;
    private clickCounts: Map<string, number> = new Map();

    async fetchAd(): Promise<Ad> {
        // Ensure we don't show the same ad twice in a row
        let newIndex: number;
        do {
            newIndex = Math.floor(Math.random() * mockAds.length);
        } while (newIndex === this.lastAdIndex && mockAds.length > 1);

        this.lastAdIndex = newIndex;
        return mockAds[newIndex];
    }

    async fetchAdByCategory(category: AdCategory): Promise<Ad> {
        const categoryAds = mockAds.filter(ad => ad.category === category);
        if (categoryAds.length === 0) {
            return this.fetchAd();
        }
        const index = Math.floor(Math.random() * categoryAds.length);
        return categoryAds[index];
    }

    trackClick(adId: string): void {
        const currentCount = this.clickCounts.get(adId) || 0;
        this.clickCounts.set(adId, currentCount + 1);
        console.log(`[AdService] Ad clicked: ${adId}, total clicks: ${currentCount + 1}`);
    }

    getClickStats(): Map<string, number> {
        return new Map(this.clickCounts);
    }
}

export class AdService {
    private static instance: AdService;
    private provider: IAdProvider;
    private adsEnabled: boolean = true;

    private constructor(provider?: IAdProvider) {
        this.provider = provider || new MockAdProvider();
    }

    static getInstance(provider?: IAdProvider): AdService {
        if (!AdService.instance) {
            AdService.instance = new AdService(provider);
        }
        return AdService.instance;
    }

    static resetInstance(): void {
        AdService.instance = undefined as unknown as AdService;
    }

    setProvider(provider: IAdProvider): void {
        this.provider = provider;
    }

    setEnabled(enabled: boolean): void {
        this.adsEnabled = enabled;
    }

    isEnabled(): boolean {
        return this.adsEnabled;
    }

    async getRandomAd(): Promise<Ad | null> {
        if (!this.adsEnabled) {
            return null;
        }
        return this.provider.fetchAd();
    }

    async getAdByCategory(category: AdCategory): Promise<Ad | null> {
        if (!this.adsEnabled) {
            return null;
        }
        return this.provider.fetchAdByCategory(category);
    }

    trackAdClick(adId: string): void {
        if (this.provider instanceof MockAdProvider) {
            this.provider.trackClick(adId);
        }
    }

    getAllCategories(): AdCategory[] {
        return ['software', 'hardware', 'learning', 'gaming', 'services'];
    }
}
