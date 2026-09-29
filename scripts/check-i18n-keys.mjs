// Fails if any locale is missing a key present in another locale.
// Extra plural-form suffixes (e.g. Russian `_few`/`_many`) are allowed and ignored.
import en from '../src/i18n/en.json' with { type: 'json' }
import de from '../src/i18n/de.json' with { type: 'json' }
import ru from '../src/i18n/ru.json' with { type: 'json' }

const PLURAL_SUFFIXES = ['_zero', '_one', '_two', '_few', '_many', '_other']

function baseKey(key) {
  const suffix = PLURAL_SUFFIXES.find((s) => key.endsWith(s))
  return suffix ? key.slice(0, -suffix.length) : key
}

const locales = { en, de, ru }
const baseKeysByLocale = Object.fromEntries(
  Object.entries(locales).map(([name, dict]) => [name, new Set(Object.keys(dict).map(baseKey))]),
)

let ok = true
for (const [name, keys] of Object.entries(baseKeysByLocale)) {
  for (const [otherName, otherKeys] of Object.entries(baseKeysByLocale)) {
    if (name === otherName) continue
    for (const key of keys) {
      if (!otherKeys.has(key)) {
        console.error(`[i18n] "${key}" exists in ${name} but is missing from ${otherName}`)
        ok = false
      }
    }
  }
}

if (!ok) {
  process.exit(1)
}
console.log('[i18n] en/de/ru locales have matching key sets.')
