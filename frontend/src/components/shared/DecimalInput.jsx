import { useState } from "react"
import { Input } from "@/components/ui/Input"

function parseDecimal(value) {
  if (value === null || value === undefined) return undefined
  if (typeof value === "number") return value
  const text = String(value).trim()
  if (text === "") return undefined
  const num = Number(text.replace(",", "."))
  return Number.isFinite(num) ? num : undefined
}

function formatDecimal(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return ""
  return String(value).replace(".", ",")
}

export function DecimalInput({ value, onChange, onBlur, ...props }) {
  const [text, setText] = useState(() => formatDecimal(value))
  const [prevValue, setPrevValue] = useState(value)

  if (value !== prevValue) {
    setPrevValue(value)
    if (text !== "" && parseDecimal(text) !== parseDecimal(value)) {
      setText(formatDecimal(value))
    }
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(event) => {
        const raw = event.target.value
        setText(raw)
        onChange?.(parseDecimal(raw))
      }}
      onBlur={(event) => {
        onBlur?.(event)
        const parsed = parseDecimal(text)
        if (parsed !== undefined) {
          setText(formatDecimal(parsed))
        }
      }}
    />
  )
}
