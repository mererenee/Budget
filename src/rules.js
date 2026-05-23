// ─── Default Categorization Rules ───────────────────────────────────────────
// These are seeded from your real merchant history. Add more via the Auto-Cat tab.
// Format: { kw: 'keyword', cat: 'Category', src: 'built-in' | 'learned' | 'custom' }

let RULES = [
  // ── Mortgage & Housing ──────────────────────────────────────────────────
  { kw:'pennymac',             cat:'Mortgage',                   src:'built-in' },
  { kw:'mortgage',             cat:'Mortgage',                   src:'built-in' },

  // ── Utilities ───────────────────────────────────────────────────────────
  { kw:'withlacoochee',        cat:'Electric',                   src:'built-in' },
  { kw:'duke energy',          cat:'Electric',                   src:'built-in' },
  { kw:'pasco county uti',     cat:'Water',                      src:'built-in' },
  { kw:'pasco water',          cat:'Water',                      src:'built-in' },
  { kw:'summit broadband',     cat:'Internet',                   src:'built-in' },
  { kw:'xfinity',              cat:'Internet',                   src:'built-in' },

  // ── Lawn & Home Services ────────────────────────────────────────────────
  { kw:'trugreen',             cat:'Lawn Treatment',             src:'built-in' },
  { kw:'tru green',            cat:'Lawn Treatment',             src:'built-in' },
  { kw:'mowing',               cat:'Mowing',                     src:'built-in' },
  { kw:'lawn care',            cat:'Mowing',                     src:'built-in' },
  { kw:'adt ',                 cat:'ADT Security',               src:'built-in' },
  { kw:'safe streets',         cat:'ADT Security',               src:'built-in' },
  { kw:'scentsy',              cat:'Home Maintenance',           src:'built-in' },

  // ── Insurance ───────────────────────────────────────────────────────────
  { kw:'usaa life',            cat:'Killian Life Insurance',     src:'built-in' },
  { kw:'usaa insurance pmt',   cat:'USAA Insurance',             src:'built-in' },
  { kw:'usaa p&c',             cat:'USAA Insurance',             src:'built-in' },
  { kw:'northwestern mutual',  cat:'Life Insurance Plans',       src:'built-in' },
  { kw:'life insurance',       cat:'Life Insurance Plans',       src:'built-in' },
  { kw:'usaa funds transfer',  cat:'Life Insurance Plans',       src:'built-in' },

  // ── Phone & Subscriptions ───────────────────────────────────────────────
  { kw:'verizon',              cat:'Cell Phones',                src:'built-in' },
  { kw:'t-mobile',             cat:'Cell Phones',                src:'built-in' },
  { kw:'spotify',              cat:'Spotify',                    src:'built-in' },
  { kw:'youtube',              cat:'TV Subscriptions',           src:'built-in' },
  { kw:'netflix',              cat:'TV Subscriptions',           src:'built-in' },
  { kw:'hulu',                 cat:'TV Subscriptions',           src:'built-in' },
  { kw:'disney+',              cat:'TV Subscriptions',           src:'built-in' },
  { kw:'apple tv',             cat:'TV Subscriptions',           src:'built-in' },
  { kw:'paramount',            cat:'TV Subscriptions',           src:'built-in' },
  { kw:'peacock',              cat:'TV Subscriptions',           src:'built-in' },
  { kw:'max.com',              cat:'TV Subscriptions',           src:'built-in' },
  { kw:'peloton',              cat:'Peloton',                    src:'built-in' },
  { kw:'planet fitness',       cat:'Gym Memberships',            src:'built-in' },
  { kw:'la fitness',           cat:'Gym Memberships',            src:'built-in' },
  { kw:'usf athl',             cat:'USF Athletics',              src:'built-in' },
  { kw:'usf bulls',            cat:'USF Athletics',              src:'built-in' },
  { kw:'oura',                 cat:'Oura',                       src:'built-in' },
  { kw:'madeline moves',       cat:'Madeline Moves',             src:'built-in' },
  { kw:'moves app',            cat:'Madeline Moves',             src:'built-in' },

  // ── Loans ───────────────────────────────────────────────────────────────
  { kw:'mohela',               cat:'Mohela',                     src:'built-in' },
  { kw:'sallie mae',           cat:'Sallie Mae',                 src:'built-in' },
  { kw:'nelnet',               cat:'Nelnet',                     src:'built-in' },
  { kw:'dept of ed',           cat:'Nelnet',                     src:'built-in' },
  { kw:'department of edu',    cat:'Nelnet',                     src:'built-in' },

  // ── Credit Cards ────────────────────────────────────────────────────────
  { kw:'chase credit card',    cat:'Freedom CC - PMK',           src:'built-in' },
  { kw:'freedom cc',           cat:'Freedom CC - PMK',           src:'built-in' },
  { kw:'usaa credit card',     cat:'Freedom CC - MRN',           src:'built-in' },

  // ── Childcare / School ──────────────────────────────────────────────────
  { kw:'discovery point',      cat:'Discovery Point & Soccer',   src:'built-in' },
  { kw:'brightwheel',          cat:'Discovery Point & Soccer',   src:'built-in' },
  { kw:'happyfeet',            cat:'Discovery Point & Soccer',   src:'built-in' },
  { kw:'florida prepaid',      cat:'FL Prepaid',                 src:'built-in' },
  { kw:'fl prepaid',           cat:'FL Prepaid',                 src:'built-in' },

  // ── Storage ─────────────────────────────────────────────────────────────
  { kw:'extra space',          cat:'Storage',                    src:'built-in' },
  { kw:'public storage',       cat:'Storage',                    src:'built-in' },

  // ── Coaching ────────────────────────────────────────────────────────────
  { kw:'instagram',            cat:'Grace Coaching',             src:'built-in' },
  { kw:'grace coaching',       cat:'Grace Coaching',             src:'built-in' },

  // ── Groceries & Household ───────────────────────────────────────────────
  { kw:'publix',               cat:'Household/Groceries',        src:'built-in' },
  { kw:'aldi',                 cat:'Household/Groceries',        src:'built-in' },
  { kw:'walmart',              cat:'Household/Groceries',        src:'built-in' },
  { kw:'target',               cat:'Household/Groceries',        src:'built-in' },
  { kw:'costco',               cat:'Household/Groceries',        src:'built-in' },
  { kw:"sam's club",           cat:'Household/Groceries',        src:'built-in' },
  { kw:'whole foods',          cat:'Household/Groceries',        src:'built-in' },
  { kw:'trader joe',           cat:'Household/Groceries',        src:'built-in' },
  { kw:'instacart',            cat:'Household/Groceries',        src:'built-in' },
  { kw:'amazon',               cat:'Household/Groceries',        src:'built-in' },
  { kw:'amzn',                 cat:'Household/Groceries',        src:'built-in' },
  { kw:'walgreens',            cat:'Household/Groceries',        src:'built-in' },
  { kw:'cvs',                  cat:'Household/Groceries',        src:'built-in' },
  { kw:'dollar tree',          cat:'Household/Groceries',        src:'built-in' },
  { kw:'dollar general',       cat:'Household/Groceries',        src:'built-in' },

  // ── Gas ─────────────────────────────────────────────────────────────────
  { kw:'racetrac',             cat:'Gas',                        src:'built-in' },
  { kw:'circle k',             cat:'Gas',                        src:'built-in' },
  { kw:'speedway',             cat:'Gas',                        src:'built-in' },
  { kw:'7-eleven',             cat:'Gas',                        src:'built-in' },
  { kw:'shell',                cat:'Gas',                        src:'built-in' },
  { kw:'bp ',                  cat:'Gas',                        src:'built-in' },
  { kw:'chevron',              cat:'Gas',                        src:'built-in' },
  { kw:'wawa',                 cat:'Gas',                        src:'built-in' },
  { kw:'exxon',                cat:'Gas',                        src:'built-in' },
  { kw:'murphyusa',            cat:'Gas',                        src:'built-in' },

  // ── Tolls ───────────────────────────────────────────────────────────────
  { kw:'sunpass',              cat:'Tolls',                      src:'built-in' },
  { kw:'e-pass',               cat:'Tolls',                      src:'built-in' },
  { kw:'toll',                 cat:'Tolls',                      src:'built-in' },

  // ── Takeout & Restaurants ───────────────────────────────────────────────
  { kw:'chipotle',             cat:'Takeout',                    src:'built-in' },
  { kw:'mcdonald',             cat:'Takeout',                    src:'built-in' },
  { kw:'chick-fil-a',          cat:'Takeout',                    src:'built-in' },
  { kw:'chickfil',             cat:'Takeout',                    src:'built-in' },
  { kw:'starbucks',            cat:'Takeout',                    src:'built-in' },
  { kw:'dutch bros',           cat:'Takeout',                    src:'built-in' },
  { kw:'panera',               cat:'Takeout',                    src:'built-in' },
  { kw:'pizza hut',            cat:'Takeout',                    src:'built-in' },
  { kw:'papa john',            cat:'Takeout',                    src:'built-in' },
  { kw:'domino',               cat:'Takeout',                    src:'built-in' },
  { kw:'cava',                 cat:'Takeout',                    src:'built-in' },
  { kw:'subway',               cat:'Takeout',                    src:'built-in' },
  { kw:'taco bell',            cat:'Takeout',                    src:'built-in' },
  { kw:'five guys',            cat:'Takeout',                    src:'built-in' },
  { kw:'olive garden',         cat:'Takeout',                    src:'built-in' },
  { kw:'doordash',             cat:'Takeout',                    src:'built-in' },
  { kw:'grubhub',              cat:'Takeout',                    src:'built-in' },
  { kw:'uber eats',            cat:'Takeout',                    src:'built-in' },
  { kw:'bella brava',          cat:'Takeout',                    src:'built-in' },
  { kw:"wendy's",              cat:'Takeout',                    src:'built-in' },
  { kw:'burger king',          cat:'Takeout',                    src:'built-in' },

  // ── Medical ─────────────────────────────────────────────────────────────
  { kw:'baycare',              cat:'Killian Doctors',            src:'built-in' },
  { kw:'johns hopkins',        cat:'Killian Doctors',            src:'built-in' },
  { kw:'envision',             cat:'Killian Doctors',            src:'built-in' },
  { kw:'nemours',              cat:'Girls Doctors',              src:'built-in' },
  { kw:'advent health',        cat:'Meredith Doctors',           src:'built-in' },
  { kw:'tampa general',        cat:'Meredith Doctors',           src:'built-in' },

  // ── Grooming ────────────────────────────────────────────────────────────
  { kw:'sage salon',           cat:'Grooming',                   src:'built-in' },
  { kw:'noire nail',           cat:'Grooming',                   src:'built-in' },
  { kw:'great clips',          cat:'Grooming',                   src:'built-in' },
  { kw:'sport clips',          cat:'Grooming',                   src:'built-in' },
  { kw:'barber',               cat:'Grooming',                   src:'built-in' },

  // ── Auto ────────────────────────────────────────────────────────────────
  { kw:'autozone',             cat:'Car Maintenance',            src:'built-in' },
  { kw:"o'reilly auto",        cat:'Car Maintenance',            src:'built-in' },
  { kw:'jiffy lube',           cat:'Car Maintenance',            src:'built-in' },
  { kw:'valvoline',            cat:'Car Maintenance',            src:'built-in' },
  { kw:'firestone',            cat:'Car Maintenance',            src:'built-in' },
  { kw:'mavis',                cat:'Car Maintenance',            src:'built-in' },

  // ── Vet / Pet ───────────────────────────────────────────────────────────
  { kw:'caring paws',          cat:'Kellam (vet)',               src:'built-in' },
  { kw:'pet resort',           cat:'Kellam (vet)',               src:'built-in' },
  { kw:'banfield',             cat:'Kellam (vet)',               src:'built-in' },
  { kw:'kellam',               cat:'Kellam (vet)',               src:'built-in' },

  // ── Travel ──────────────────────────────────────────────────────────────
  { kw:'united airlines',      cat:'Travel Plans',               src:'built-in' },
  { kw:'delta air',            cat:'Travel Plans',               src:'built-in' },
  { kw:'southwest',            cat:'Travel Plans',               src:'built-in' },
  { kw:'airbnb',               cat:'Travel Plans',               src:'built-in' },
  { kw:'marriott',             cat:'Travel Plans',               src:'built-in' },
  { kw:'hilton',               cat:'Travel Plans',               src:'built-in' },
  { kw:'expedia',              cat:'Travel Plans',               src:'built-in' },
  { kw:'vrbo',                 cat:'Travel Plans',               src:'built-in' },

  // ── Income ──────────────────────────────────────────────────────────────
  { kw:'direct dep',           cat:'Income',                     src:'built-in' },
  { kw:'mrn check',            cat:'Income',                     src:'built-in' },
  { kw:'pmk check',            cat:'Income',                     src:'built-in' },
  { kw:'payroll',              cat:'Income',                     src:'built-in' },
  { kw:'paycheck',             cat:'Income',                     src:'built-in' },
  { kw:'ach credit',           cat:'Income',                     src:'built-in' },

  // ── Savings Transfers ───────────────────────────────────────────────────
  { kw:'transfer to savings',  cat:'Savings: Emergency Fund',    src:'built-in' },
  { kw:'emergency fund',       cat:'Savings: Emergency Fund',    src:'built-in' },

  // ── Taxes ───────────────────────────────────────────────────────────────
  { kw:'irs ',                 cat:'Taxes',                      src:'built-in' },
  { kw:'florida dept revenue', cat:'Taxes',                      src:'built-in' },
];
