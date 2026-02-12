import * as React from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export function ImageUpload({ name }) {
  const [preview, setPreview] = React.useState(null)
  const inputRef = React.useRef(null)

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="flex flex-col">

      <div
        className={cn(
          "relative flex h-27 w-full cursor-pointer items-center justify-center rounded-md border border-dashed bg-neutral-100",
          "hover:bg-neutral-200 transition"
        )}
        onClick={() => inputRef.current.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover rounded-md"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <span className="text-xs">
              Cargar imagen
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
