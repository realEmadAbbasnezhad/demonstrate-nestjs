import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HashService {
  private readonly saltLength = 16;
  private readonly iterations = 10000;
  private readonly keyLength = 64;
  private readonly digest = 'sha512';

  hash(toHash: string): Promise<string> {
    const salt = crypto.randomBytes(this.saltLength).toString('hex');
    const hash = crypto
      .pbkdf2Sync(toHash, salt, this.iterations, this.keyLength, this.digest)
      .toString('hex');
    return Promise.resolve(`${salt}:${hash}`);
  }

  verify(toVerify: string, hashed: string): Promise<boolean> {
    const [salt, hash] = hashed.split(':');
    const hashToVerify = crypto
      .pbkdf2Sync(toVerify, salt, this.iterations, this.keyLength, this.digest)
      .toString('hex');
    return Promise.resolve(hash === hashToVerify);
  }
}
