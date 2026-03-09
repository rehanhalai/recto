import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBook } from './types/book.type';

interface AffiliateLink {
  name: string;
  url: string;
  platform: string;
}

interface PurchaseLinks {
  [key: string]: AffiliateLink;
}

type CountryCode = 'US' | 'UK' | 'IN' | 'CA' | 'AU' | 'DE' | 'FR';

interface CountryConfig {
  amazonDomain: string;
  amazonRegion: string;
  koboRegion: string;
}

const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  US: { amazonDomain: 'amazon.com', amazonRegion: 'us', koboRegion: 'us/en' },
  UK: { amazonDomain: 'amazon.co.uk', amazonRegion: 'uk', koboRegion: 'gb/en' },
  IN: { amazonDomain: 'amazon.in', amazonRegion: 'in', koboRegion: 'in/en' },
  CA: { amazonDomain: 'amazon.ca', amazonRegion: 'ca', koboRegion: 'ca/en' },
  AU: {
    amazonDomain: 'amazon.com.au',
    amazonRegion: 'au',
    koboRegion: 'au/en',
  },
  DE: { amazonDomain: 'amazon.de', amazonRegion: 'de', koboRegion: 'de/de' },
  FR: { amazonDomain: 'amazon.fr', amazonRegion: 'fr', koboRegion: 'fr/fr' },
};

@Injectable()
export class AffiliateService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get country-specific affiliate ID from environment variables
   * Falls back to default country (US) if specific country ID not found
   */
  private getAffiliateId(
    platform: string,
    country: CountryCode = 'US',
  ): string | undefined {
    const envKey = `${platform.toUpperCase()}_AFFILIATE_ID_${country}`;
    const defaultEnvKey = `${platform.toUpperCase()}_AFFILIATE_ID`;

    return (
      this.configService.get<string>(envKey) ||
      this.configService.get<string>(defaultEnvKey)
    );
  }

  /**
   * Generate purchase links for book retailers
   */
  generatePurchaseLinks(
    book: IBook,
    country: CountryCode = 'US',
  ): PurchaseLinks {
    const links: PurchaseLinks = {};
    const config = COUNTRY_CONFIGS[country];
    const searchQuery = encodeURIComponent(book.title);

    // 1. AMAZON
    const amazonAffiliateId = this.getAffiliateId('amazon', country);
    if (amazonAffiliateId) {
      links.amazon = {
        name: 'Amazon',
        platform: 'amazon',
        url: `https://www.${config.amazonDomain}/s?k=${searchQuery}&tag=${amazonAffiliateId}`,
      };
    } else {
      links.amazon = {
        name: 'Amazon',
        platform: 'amazon',
        url: `https://www.${config.amazonDomain}/s?k=${searchQuery}`,
      };
    }

    // 2. KOBO
    const koboAffiliateId = this.getAffiliateId('kobo', country);
    if (koboAffiliateId) {
      links.kobo = {
        name: 'Kobo',
        platform: 'kobo',
        url: `https://www.kobo.com/${config.koboRegion}/search?query=${searchQuery}&affid=${koboAffiliateId}`,
      };
    } else {
      links.kobo = {
        name: 'Kobo',
        platform: 'kobo',
        url: `https://www.kobo.com/${config.koboRegion}/search?query=${searchQuery}`,
      };
    }

    // 3. BOOKSHOP.ORG
    if (country === 'US') {
      const bookshopAffiliateId = this.getAffiliateId('bookshop', country);
      if (bookshopAffiliateId) {
        links.bookshoporg = {
          name: 'Bookshop.org',
          platform: 'bookshoporg',
          url: `https://bookshop.org/search?q=${searchQuery}&aff=${bookshopAffiliateId}`,
        };
      } else {
        links.bookshoporg = {
          name: 'Bookshop.org',
          platform: 'bookshoporg',
          url: `https://bookshop.org/search?q=${searchQuery}`,
        };
      }
    }

    // 4. PROJECT GUTENBERG
    links.gutenberg = {
      name: 'Project Gutenberg',
      platform: 'gutenberg',
      url: `https://www.gutenberg.org/ebooks/search/?query=${searchQuery}`,
    };

    // 5. OPEN LIBRARY
    if (book.externalId) {
      links.openlibrary = {
        name: 'Open Library',
        platform: 'openlibrary',
        url: `https://openlibrary.org/works/${book.externalId}`,
      };
    }

    return links;
  }

  getCountryCode(userCountry?: string): CountryCode {
    const countryMap: Record<string, CountryCode> = {
      US: 'US',
      UK: 'UK',
      IN: 'IN',
      CA: 'CA',
      AU: 'AU',
      DE: 'DE',
      FR: 'FR',
    };
    return countryMap[userCountry?.toUpperCase() || 'US'] || 'US';
  }

  groupPurchaseLinksByCategory(
    book: IBook,
    country: CountryCode = 'US',
  ): { affiliate: PurchaseLinks; free: PurchaseLinks } {
    const allLinks = this.generatePurchaseLinks(book, country);

    const affiliate: PurchaseLinks = {
      amazon: allLinks.amazon,
      kobo: allLinks.kobo,
    };

    if (country === 'US' && allLinks.bookshoporg) {
      affiliate.bookshoporg = allLinks.bookshoporg;
    }

    return {
      affiliate,
      free: {
        openlibrary: allLinks.openlibrary,
        gutenberg: allLinks.gutenberg,
      },
    };
  }
}
