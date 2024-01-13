import { hash as bcryptHash, compare as bcryptCompare } from 'bcrypt';

export function hash(data: string): Promise<string> {
  return bcryptHash(data, 10);
}

export function compare(data: string, hash: string): Promise<boolean> {
  return bcryptCompare(data, hash);
}
