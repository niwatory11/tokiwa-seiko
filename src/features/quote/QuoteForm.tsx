import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { categoryOptions, materialOptions, quoteNotes } from '../../data/quote'
import { emptyQuoteValues } from './types'
import type { QuoteErrors, QuoteField, QuoteValues } from './types'
import {
  maxDateString,
  minDateString,
  validateAll,
  validateField,
} from './validation'
import styles from './QuoteForm.module.css'

const FIELD_ORDER: QuoteField[] = [
  'company',
  'department',
  'name',
  'email',
  'phone',
  'category',
  'material',
  'deadline',
  'details',
]

const FIELD_LABELS: Record<QuoteField, string> = {
  company: '会社名',
  department: '部署名',
  name: 'ご担当者名',
  email: 'メールアドレス',
  phone: '電話番号',
  category: 'ご相談の区分',
  material: '材質',
  deadline: 'ご希望納期',
  details: 'ご依頼内容',
}

function fieldId(field: QuoteField): string {
  return `qt-${field}`
}

function errorId(field: QuoteField): string {
  return `qt-${field}-error`
}

type Status = 'idle' | 'done'

type FieldShellProps = {
  field: QuoteField
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

/** ラベル+入力+ヒント+エラーの共通枠 */
function FieldShell({ field, required, error, hint, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId(field)} className={styles.label}>
        {FIELD_LABELS[field]}
        {required && (
          <span className={styles.required} aria-hidden="true">
            必須
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${fieldId(field)}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId(field)} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}

/** 見積もり依頼フォーム(フロントエンドバリデーションのみ。外部送信なし) */
export function QuoteForm() {
  const [values, setValues] = useState<QuoteValues>(emptyQuoteValues)
  const [errors, setErrors] = useState<QuoteErrors>({})
  const [showSummary, setShowSummary] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  const applyError = (field: QuoteField, message: string | null) => {
    setErrors((prev) => {
      const next = { ...prev }
      if (message) {
        next[field] = message
      } else {
        delete next[field]
      }
      return next
    })
  }

  const handleChange = (field: QuoteField, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    // 一度エラーになった項目は、入力のたびに再検証して直ちに解消を伝える
    if (errors[field]) {
      applyError(field, validateField(field, next, new Date()))
    }
  }

  const handleBlur = (field: QuoteField) => {
    applyError(field, validateField(field, values, new Date()))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const all = validateAll(values, new Date())
    setErrors(all)
    const invalidFields = FIELD_ORDER.filter((field) => all[field])

    if (invalidFields.length > 0) {
      setShowSummary(true)
      document.getElementById(fieldId(invalidFields[0]))?.focus()
      return
    }

    setShowSummary(false)
    setStatus('done')
  }

  const describedBy = (field: QuoteField, hasHint = false) => {
    const ids: string[] = []
    if (errors[field]) ids.push(errorId(field))
    if (hasHint) ids.push(`${fieldId(field)}-hint`)
    return ids.length > 0 ? ids.join(' ') : undefined
  }

  const textInputProps = (field: QuoteField) => ({
    id: fieldId(field),
    className: styles.input,
    value: values[field],
    onChange: (e: { target: { value: string } }) =>
      handleChange(field, e.target.value),
    onBlur: () => handleBlur(field),
    'aria-invalid': Boolean(errors[field]),
  })

  if (status === 'done') {
    return (
      <div role="status" className={styles.doneBox}>
        <p className={styles.doneTitle}>見積もりフォームのデモが完了しました</p>
        <p className={styles.doneBody}>
          入力された内容は保存・送信されていません。実在する企業への見積もり依頼も成立していません。
        </p>
        <p className={styles.doneNote}>ご入力ありがとうございました。</p>
      </div>
    )
  }

  const invalidFields = FIELD_ORDER.filter((field) => errors[field])
  const today = new Date()

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {showSummary && invalidFields.length > 0 && (
        <div role="alert" className={styles.summary}>
          <p className={styles.summaryTitle}>
            入力内容に{invalidFields.length}件の不備があります
          </p>
          <ul className={styles.summaryList}>
            {invalidFields.map((field) => (
              <li key={field}>
                <a
                  href={`#${fieldId(field)}`}
                  className={styles.summaryLink}
                  onClick={(event) => {
                    event.preventDefault()
                    document.getElementById(fieldId(field))?.focus()
                  }}
                >
                  {FIELD_LABELS[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.grid}>
        <FieldShell field="company" required error={errors.company}>
          <input
            type="text"
            autoComplete="organization"
            required
            maxLength={60}
            aria-describedby={describedBy('company')}
            {...textInputProps('company')}
          />
        </FieldShell>

        <FieldShell field="department" error={errors.department}>
          <input
            type="text"
            autoComplete="organization-title"
            maxLength={60}
            aria-describedby={describedBy('department')}
            {...textInputProps('department')}
          />
        </FieldShell>

        <FieldShell field="name" required error={errors.name}>
          <input
            type="text"
            autoComplete="name"
            required
            maxLength={30}
            aria-describedby={describedBy('name')}
            {...textInputProps('name')}
          />
        </FieldShell>

        <FieldShell field="email" required error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            required
            aria-describedby={describedBy('email')}
            {...textInputProps('email')}
          />
        </FieldShell>

        <FieldShell field="phone" required error={errors.phone}>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            placeholder="03-0000-0000"
            aria-describedby={describedBy('phone')}
            {...textInputProps('phone')}
          />
        </FieldShell>

        <FieldShell field="category" required error={errors.category}>
          <select
            required
            aria-describedby={describedBy('category')}
            {...textInputProps('category')}
          >
            <option value="">選択してください</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell field="material" required error={errors.material}>
          <select
            required
            aria-describedby={describedBy('material')}
            {...textInputProps('material')}
          >
            <option value="">選択してください</option>
            {materialOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell
          field="deadline"
          required
          error={errors.deadline}
          hint={quoteNotes.deadline}
        >
          <input
            type="date"
            required
            min={minDateString(today)}
            max={maxDateString(today)}
            aria-describedby={describedBy('deadline', true)}
            {...textInputProps('deadline')}
          />
        </FieldShell>

        <FieldShell
          field="details"
          required
          error={errors.details}
          hint="部品の用途・数量・材質・寸法の概要をご記入ください(600文字まで)。"
        >
          <textarea
            rows={5}
            required
            maxLength={600}
            aria-describedby={describedBy('details', true)}
            {...textInputProps('details')}
          />
        </FieldShell>
      </div>

      <button type="submit" className={styles.submit}>
        入力内容を確認する
      </button>
      <p className={styles.formNote}>{quoteNotes.file}</p>
    </form>
  )
}
