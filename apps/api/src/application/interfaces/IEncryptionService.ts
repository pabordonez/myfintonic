// /Users/pabloordonezmiguel/Downloads/Master/BIGSCHOOL/TALLERES/myfintonic-api/apps/api/src/application/interfaces/IEncryptionService.ts
export interface IEncryptionService {
  hash(value: string): Promise<string>
  compare(value: string, hashedValue: string): Promise<boolean>
}
