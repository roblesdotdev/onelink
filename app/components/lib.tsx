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
    <div className="flex w-full flex-col">
      <div className="flex w-full rounded-md bg-white text-lg ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-slate-900">
        <p className="py-4 pl-3 font-medium text-slate-600">
          <label htmlFor="yourname">onelink.lite/</label>
        </p>
        <p className="py-4 pr-3">
          <input
            placeholder="your name"
            name="yourname"
            id="yourname"
            className="w-full font-medium text-slate-900 outline-none placeholder:font-normal"
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
