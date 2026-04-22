import { Injectable } from '@nestjs/common';

interface RedisSetOptions {
  EX?: number;
}

@Injectable()
export class RedisService {
  private blacklist = new Map<string, number>();

  async set(token: string, _value: string, options?: RedisSetOptions): Promise<void> {
    const ttl = options?.EX;
    if (!ttl || ttl <= 0) {
      return;
    }

    const expiresAt = Math.floor(Date.now() / 1000) + ttl;
    this.blacklist.set(token, expiresAt);
    this.cleanup();
  }

  async get(token: string): Promise<string | null> {
    this.cleanup();
    return this.blacklist.has(token) ? 'revoked' : null;
  }

  isBlacklisted(token: string): boolean {
    this.cleanup();
    return this.blacklist.has(token);
  }

  private cleanup(): void {
    const now = Math.floor(Date.now() / 1000);
    for (const [token, exp] of this.blacklist.entries()) {
      if (exp <= now) {
        this.blacklist.delete(token);
      }
    }
  }
}