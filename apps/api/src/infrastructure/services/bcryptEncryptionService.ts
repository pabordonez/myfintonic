import bcrypt from 'bcrypt'
import { IEncryptionService } from '@application/interfaces/IEncryptionService'

export class BcryptEncryptionService implements IEncryptionService {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, 10)
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue)
  }
}
