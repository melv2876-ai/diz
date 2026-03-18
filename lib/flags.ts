type FlagLookupInput =
  | string
  | null
  | undefined
  | {
      code?: string | null;
      postalCode?: string | null;
      countryName?: string | null;
    };

const FLAG_CODE_BY_POSTAL: Record<string, string> = {
  F: 'fr',
  N: 'no',
  CN: 'cy',
  SL: 'so',
};

const FLAG_CODE_BY_COUNTRY_NAME: Record<string, string> = {
  france: 'fr',
  norway: 'no',
  'n cyprus': 'cy',
  somaliland: 'so',
  'united states of america': 'us',
  'united states': 'us',
  usa: 'us',
  uk: 'gb',
  'united kingdom': 'gb',
  'great britain': 'gb',
  'czech republic': 'cz',
  'north macedonia': 'mk',
  'south korea': 'kr',
  'north korea': 'kp',
  'russian federation': 'ru',
  'syrian arab republic': 'sy',
  'lao pdr': 'la',
  'laos': 'la',
  'moldova, republic of': 'md',
  'viet nam': 'vn',
  'venezuela, bolivarian republic of': 've',
};

function normalizeCountryNameKey(countryName?: string | null) {
  if (!countryName) {
    return '';
  }

  return countryName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'\u2019]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeTwoLetterCode(code?: string | null) {
  if (!code || code.length !== 2) {
    return null;
  }

  const normalized = code.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return null;
  }

  return normalized.toLowerCase();
}

export function resolveFlagCode(input: FlagLookupInput) {
  if (typeof input === 'string' || input == null) {
    return normalizeTwoLetterCode(input);
  }

  const directCode = normalizeTwoLetterCode(input.code);

  if (directCode) {
    return directCode;
  }

  const postalCode = input.postalCode?.trim().toUpperCase() ?? '';

  if (postalCode && FLAG_CODE_BY_POSTAL[postalCode]) {
    return FLAG_CODE_BY_POSTAL[postalCode];
  }

  const countryName = normalizeCountryNameKey(input.countryName);

  if (countryName && FLAG_CODE_BY_COUNTRY_NAME[countryName]) {
    return FLAG_CODE_BY_COUNTRY_NAME[countryName];
  }

  return null;
}

export function resolveFlagMeta(input: FlagLookupInput) {
  const code = resolveFlagCode(input);

  return {
    code,
    className: code ? `fi fi-${code}` : '',
  };
}

export function getFlagClassName(input: FlagLookupInput) {
  return resolveFlagMeta(input).className;
}
