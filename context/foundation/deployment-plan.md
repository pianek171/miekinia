# Plan pierwszego wdrożenia

## Cel

Opublikować techniczną wersję bazową „Smród Miękinia” na Cloudflare Workers jako `smrod-miekinia.<account-subdomain>.workers.dev`, z produkcyjnym Supabase w regionie `eu-west-1` (Irlandia). Wdrożenie nie obejmuje CI/CD ani domeny własnej.

## Ustalenia

- Runtime: Astro SSR z `@astrojs/cloudflare` i Cloudflare Workers; konfiguracja Workers jest źródłem prawdy, mimo starszej wzmianki o Cloudflare Pages w `tech-stack.md`.
- Worker: `smrod-miekinia`.
- Supabase: nowy projekt produkcyjny w `eu-west-1` (Irlandia, UE); Warszawa nie jest dostępna na liście regionów Supabase.
- Administrator: jedno konto utworzone ręcznie; potwierdzenie e-mail pozostaje wymagane.
- Rejestracja publiczna: wyłączona przed udostępnieniem aplikacji.

## Przygotowanie ręczne

1. Zalogować się do konta Cloudflare z uprawnieniem do tworzenia Workers i aktywnym adresem `workers.dev`.
2. Utworzyć projekt Supabase `smrod-miekinia` w regionie `eu-west-1` (Irlandia) i zachować hasło bazy w menedżerze haseł.
3. W Supabase przygotować Project URL i publishable/anon key; wartości nie mogą trafić do repozytorium ani czatu.
4. W `Authentication → Sign In / Providers → Email` pozostawić włączone `Confirm Email` oraz wyłączyć `Allow new users to sign up`.
5. Po deployu wpisać dokładny adres `workers.dev` jako `Site URL` i dozwolony `Redirect URL` w `Authentication → URL Configuration`.
6. Pozostawić domyślne szablony e-mail Supabase. Aplikacja obsługuje domyślny fragment URL z tokenami sesji i zapisuje sesję wyłącznie w cookies Workera.
7. Po ustawieniu URL zaprosić administratora w `Authentication → Users → Add user → Send invitation`.

## Realizacja

1. Ustawić produkcyjną nazwę `smrod-miekinia` w `wrangler.jsonc`, zachowując adapter Cloudflare, `nodejs_compat` i binding assetów.
2. Usunąć lub zablokować trasę oraz interfejs `/auth/signup`; istniejące logowanie administratora pozostawić dostępne.
3. Naprawić obecne błędy `npm run lint` w plikach integracji Astro/Supabase bez wyłączania reguł ESLint.
4. Wykonać lokalnie `npm run lint`, `npm run build` i `npx wrangler dev`; potwierdzić, że automatycznie sygnalizowane przez adapter mechanizmy `SESSION` oraz `IMAGES` nie wymagają dodatkowych bindingów. Binding dodać tylko, gdy test runtime wykaże jego potrzebę.
5. Po zatwierdzeniu produkcji uwierzytelnić Wrangler na właściwym koncie i wykonać `npx wrangler deploy`.
6. Ustawić sekrety interaktywnie, bez zapisywania ich lokalnie:

   ```bash
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_KEY
   ```

7. Sprawdzić zwrócony adres wdrożenia, skonfigurować URL-e Auth w Supabase, zaprosić administratora i zweryfikować logowanie.
8. Obserwować pierwsze żądania przez `npx wrangler tail`.

## Kryteria akceptacji

- `npm run lint` i `npm run build` kończą się powodzeniem.
- `wrangler dev` obsługuje stronę główną, logowanie i `/dashboard` bez błędów runtime lub bindingów.
- Publiczny Worker działa pod oczekiwanym adresem `workers.dev`.
- `/auth/signup` nie pozwala utworzyć konta.
- Ręcznie zaproszony, potwierdzony administrator może się zalogować.
- `SUPABASE_URL` i `SUPABASE_KEY` są wyłącznie sekretami Workera i nie występują w śledzonych plikach ani logach.

## Granice pierwszego wdrożenia

To wdrożenie publikuje bezpieczną wersję bazową startera. Formularz zgłoszenia, szablony wiadomości i anonimowe statystyki z PRD są osobnym etapem implementacji przed publicznym promowaniem produktu.
