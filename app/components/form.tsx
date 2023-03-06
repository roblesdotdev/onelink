export function YournameInput({
  yourname,
  error,
  readonly = false,
}: {
  yourname?: string
  error?: string | null
  readonly?: boolean
}) {
  return (
    <div className="flex flex-col">
      <div className="flex rounded-sm bg-white text-lg ring-slate-900 focus-within:ring-2">
        <p className="py-4 pl-3">
          <label htmlFor="yourname">onelink.lite/</label>
        </p>
        <p className="py-4 pr-3">
          <input
            placeholder="your name"
            name="yourname"
            id="yourname"
            className="w-full font-medium outline-none placeholder:font-normal"
            aria-errormessage="yourname-error"
            defaultValue={yourname}
            readOnly={readonly}
          />
        </p>
      </div>
      {error ? (
        <span id="yourname-error" className="text-sm text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  )
}
