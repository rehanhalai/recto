import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface AffiliateLink {
  name: string;
  url: string;
  platform: string;
}

export interface PurchaseLinks {
  [key: string]: AffiliateLink;
}

export type CountryCode = "US" | "UK" | "IN" | "CA" | "AU" | "DE" | "FR";

interface CountryConfig {
  amazonDomain: string;
}

const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  US: { amazonDomain: "amazon.com" },
  UK: { amazonDomain: "amazon.co.uk" },
  IN: { amazonDomain: "amazon.in" },
  CA: { amazonDomain: "amazon.ca" },
  AU: { amazonDomain: "amazon.com.au" },
  DE: { amazonDomain: "amazon.de" },
  FR: { amazonDomain: "amazon.fr" },
};

const PLATFORM_NAMES: Record<string, string> = {
  amazon: "Amazon",
  abebooks: "AbeBooks",
  bookshoporg: "Bookshop.org",
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
    country: CountryCode = "US",
  ): string | undefined {
    const envKey = `${platform.toUpperCase()}_AFFILIATE_ID_${country}`;
    const defaultEnvKey = `${platform.toUpperCase()}_AFFILIATE_ID`;

    return (
      this.configService.get<string>(envKey) ||
      this.configService.get<string>(defaultEnvKey)
    );
  }

  private cleanIsbn13(isbn13: string): string {
    return isbn13.replace(/[^0-9]/g, "");
  }

  private toIsbn10From978(isbn13: string): string {
    const core9Digits = isbn13.substring(3, 12);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(core9Digits[i], 10) * (10 - i);
    }

    const remainder = sum % 11;
    const checkMod = 11 - remainder;

    let checkDigit: string;
    if (checkMod === 10) {
      checkDigit = "X";
    } else if (checkMod === 11) {
      checkDigit = "0";
    } else {
      checkDigit = String(checkMod);
    }

    return `${core9Digits}${checkDigit}`;
  }

  private generateAmazonAffiliateLink(
    isbn13: string,
    country: CountryCode,
  ): string {
    const cleanIsbn = this.cleanIsbn13(isbn13);
    const tag =
      this.configService.get<string>("AMAZON_ASSOCIATE_TAG") ||
      this.getAffiliateId("amazon", country);
    const domain = COUNTRY_CONFIGS[country].amazonDomain;

    if (!tag) {
      throw new Error("Missing AMAZON_ASSOCIATE_TAG environment variable.");
    }

    if (cleanIsbn.length !== 13) {
      throw new Error("Invalid ISBN-13 length.");
    }

    if (cleanIsbn.startsWith("978")) {
      const isbn10 = this.toIsbn10From978(cleanIsbn);
      return `https://www.${domain}/dp/${isbn10}?tag=${tag}`;
    }

    if (cleanIsbn.startsWith("979")) {
      return `https://www.${domain}/s?k=${cleanIsbn}&tag=${tag}`;
    }

    throw new Error("Invalid ISBN-13 prefix. Must start with 978 or 979.");
  }

  private buildAbeBooksUrl(isbn13: string, country: CountryCode): string {
    const affiliateId = this.getAffiliateId("abebooks", country);
    const base = `https://www.abebooks.com/servlet/SearchResults?isbn=${isbn13}`;

    if (!affiliateId) {
      return base;
    }

    return `${base}&cm_sp=mbc-${affiliateId}`;
  }

  private buildBookshopUrl(isbn13: string, country: CountryCode): string {
    const affiliateId = this.getAffiliateId("bookshop", country);
    const base = `https://bookshop.org/search?keywords=${isbn13}`;

    if (!affiliateId) {
      return base;
    }

    return `${base}&affiliate=${affiliateId}`;
  }

  /**
   * Generate affiliate links from ISBN-13 only.
   */
  generateAffiliateLinksFromIsbn13(
    isbn13: string,
    country: CountryCode = "US",
  ): PurchaseLinks {
    const cleanIsbn = this.cleanIsbn13(isbn13);

    if (cleanIsbn.length !== 13) {
      throw new Error("Invalid ISBN-13 length.");
    }

    const links: PurchaseLinks = {};
    links.amazon = {
      name: PLATFORM_NAMES.amazon,
      platform: "amazon",
      url: this.generateAmazonAffiliateLink(cleanIsbn, country),
    };

    // 2. ABEBOOKS
    links.abebooks = {
      name: PLATFORM_NAMES.abebooks,
      platform: "abebooks",
      url: this.buildAbeBooksUrl(cleanIsbn, country),
    };

    // 3. BOOKSHOP.ORG
    links.bookshoporg = {
      name: PLATFORM_NAMES.bookshoporg,
      platform: "bookshoporg",
      url: this.buildBookshopUrl(cleanIsbn, country),
    };

    return links;
  }

  getCountryCode(userCountry?: string): CountryCode {
    const countryMap: Record<string, CountryCode> = {
      US: "US",
      UK: "UK",
      IN: "IN",
      CA: "CA",
      AU: "AU",
      DE: "DE",
      FR: "FR",
    };
    return countryMap[userCountry?.toUpperCase() || "US"] || "US";
  }
}
