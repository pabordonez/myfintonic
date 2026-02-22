import { FinancialProduct } from '@domain/models/financialProduct'
import { InterestPaymentFrequency } from '@domain/types'

export class FixedTermDeposit extends FinancialProduct {
  public initialBalance!: number
  public currentBalance!: number
  public initialDate!: Date
  public maturityDate!: Date
  public annualInterestRate!: number
  public interestPaymentFreq!: InterestPaymentFrequency

  private constructor(data: any) {
    super(data)
    this.initialBalance = data.initialBalance
    this.currentBalance = data.currentBalance ?? data.initialBalance
    this.initialDate = data.initialDate
      ? new Date(data.initialDate)
      : new Date()
    this.maturityDate = data.maturityDate
      ? new Date(data.maturityDate)
      : new Date()
    this.annualInterestRate = data.annualInterestRate
    this.interestPaymentFreq = data.interestPaymentFreq
  }

  public static create(data: any): FixedTermDeposit {
    if (data.type !== 'FIXED_TERM_DEPOSIT')
      throw new Error('Invalid product type')
    if (data.initialBalance === undefined)
      throw new Error('Missing required field: initialBalance')
    if (!data.initialDate)
      throw new Error('Missing required field: initialDate')
    if (!data.maturityDate)
      throw new Error('Missing required field: maturityDate')
    if (data.annualInterestRate === undefined)
      throw new Error('Missing required field: annualInterestRate')

    const validFrequencies = ['Monthly', 'Quarterly', 'Annual', 'AtMaturity']
    const freq = data.interestPaymentFreq
    if (!freq) throw new Error('Missing required field: interestPaymentFreq')
    if (!validFrequencies.includes(freq)) {
      throw new Error(
        `Validation failed: Invalid interestPaymentFrequency. Allowed values: ${validFrequencies.join(', ')}`
      )
    }
    return new FixedTermDeposit(data)
  }

  protected createCopy(data: any): FinancialProduct {
    return FixedTermDeposit.create(data)
  }

  getAllowedUpdateFields(): string[] {
    return [
      ...this.getCommonUpdateFields(),
      'initialBalance',
      'currentBalance',
      'initialDate',
      'maturityDate',
      'annualInterestRate',
      'interestPaymentFreq',
    ]
  }
}
