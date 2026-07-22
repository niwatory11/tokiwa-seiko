export type QuoteValues = {
  company: string
  department: string
  name: string
  email: string
  phone: string
  category: string
  material: string
  deadline: string
  details: string
}

export type QuoteField = keyof QuoteValues

export type QuoteErrors = Partial<Record<QuoteField, string>>

export const emptyQuoteValues: QuoteValues = {
  company: '',
  department: '',
  name: '',
  email: '',
  phone: '',
  category: '',
  material: '',
  deadline: '',
  details: '',
}
