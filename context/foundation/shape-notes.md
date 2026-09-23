---
project: "Smród Miękinia"
context_type: greenfield
created: 2026-09-15
updated: 2026-09-15
product_type: web-app
target_scale:
  users: medium
timeline_budget:
  mvp_weeks: 1
  hard_deadline: null
  after_hours_only: false
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6]
  gray_areas_resolved:
    - topic: "dostęp mieszkańca"
      decision: "anonimowy dostęp bez logowania"
    - topic: "dostęp administratora"
      decision: "jedno ręcznie utworzone konto z loginem i hasłem"
    - topic: "domyślny adresat"
      decision: "ZUK"
    - topic: "pamiętanie danych osobowych"
      decision: "brak zapamiętywania w MVP"
  frs_drafted: 7
  quality_check_status: accepted
---

## Seed idea

Chce zrobic strone jak najprostsza i najwygodniejsza, ktora automatyzuje
  zgloszenie reklamacji oraz problemu do roznych instytucji. Ma posiadac kilka pol do wypelnienia,
  ktore beda zmiennymi w mailu, ktory zostanie przygotowany i wyslany w imieniu uzytkownika
  (wywolujac aplikacje mail w telefonie uzytkownika wraz z uzupelnionym adresem mailowym oraz
  trescia). Ma nie zbierac zadnych danych od uzytkownika. Strona ma byc wygodna i wyswietlac sie
  prawidlowo na przegladarce mobilnej. Ma zawierac panel administratora, w ktorym bede mogl podgladac statystyki zgloszen, oraz edytowac tresc szablonow. Chce na start zrobic 2 instytuje do jednej reklamacje a do drugiej zgloszenie problemu. Nie chce przetwarzac danych uzytkownikow ze wzgledu na rodo, jednak chce zbierac ilosc zgloszen, dane o godzinie wystapienia problemu, zeby pozniej tez moc analizowac te dane. W momencie gdy uzytkownik nie bedzie mial skonfigurowanej aplikacji mail, ma byc aktywny przycisk kopiuj tresc zgloszenia.

## Vision & Problem Statement

Mieszkańcy Miękini doświadczający zapachu, prawdopodobnie związanego z kanalizacją, często nie zgłaszają go albo dzwonią, co nie prowadzi do rozwiązania problemu. Barierą jest konieczność samodzielnego opisania zdarzenia i znalezienia właściwego adresata.

Produkt obniża próg zgłoszenia, zbierając poziom zapachu oraz jego charakter i przygotowując wiadomości z istotnymi informacjami dla ZUK i burmistrza. Mieszkańcy przywykli do problemu, więc prostota wykonania jednej konkretnej czynności ma znaczenie.

## User & Persona

Mieszkaniec Miękini, który doświadcza uciążliwego zapachu i chce szybko przekazać jego opis do ZUK oraz burmistrza, bez samodzielnego pisania e-maila ani szukania adresata.

## Success Criteria

### Primary

- Mieszkaniec może przejść przez formularz i wysłać przygotowane zgłoszenie do wybranego adresata.

### Secondary

- Administrator otrzymuje lepsze statystyki zgłoszeń.

### Guardrails

- Aplikacja nie zbiera danych o użytkowniku.
- Poza anonimową statystyką działanie odbywa się w przeglądarce użytkownika.

## User Stories

### US-01: Mieszkaniec przygotowuje zgłoszenie zapachu

- **Given** mieszkaniec odczuwa smród na podwórku i w domu
- **When** wypełnia formularz i wybiera adresata
- **Then** otrzymuje formalnie przygotowaną wiadomość do właściwego adresata, aby instytucja mogła odnieść się do sytuacji

#### Acceptance Criteria

- Wybrany adresat otrzymuje przypisany do niego szablon utworzony wcześniej przez administratora.
- Treść wykorzystuje wartości z formularza: imię i nazwisko, adres, poziom oraz charakter zapachu.
- Gdy klient e-mail nie jest dostępny, mieszkaniec może skopiować treść wiadomości i przesłać ją ręcznie.
- Dane formularza służą wyłącznie do przygotowania wiadomości, nie są zapisywane przez aplikację i opuszczają przeglądarkę tylko wtedy, gdy mieszkaniec sam prześle wiadomość do adresata.
- Dane osobowe nie są zapamiętywane na potrzeby kolejnego zgłoszenia.

## Functional Requirements

- FR-001: Mieszkaniec może rozpocząć zgłoszenie zapachu. Priority: must-have
  > Socrates: Counter-argument considered: przycisk „Śmierdzi” może być niejasny dla części mieszkańców. Resolution: przy przycisku zostanie dodane krótkie wyjaśnienie.
- FR-002: Mieszkaniec może podać imię i nazwisko, adres, poziom zapachu w skali 1–5 oraz wskazać, czy zapach jest stały czy przelotny. Priority: must-have
  > Socrates: Counter-argument considered: pola z danymi osobowymi mogą zniechęcić część osób. Resolution: imię, nazwisko i adres pozostają konieczne, aby zgłoszenie miało moc urzędową; dane nie są zapamiętywane w MVP.
- FR-003: Mieszkaniec może wybrać adresata zgłoszenia: ZUK albo burmistrza; domyślnym adresatem jest ZUK. Priority: must-have
  > Socrates: Counter-argument considered: mieszkaniec może nie wiedzieć, kogo wybrać. Resolution: ZUK jest domyślnym adresatem.
- FR-004: Mieszkaniec może otworzyć przygotowaną wiadomość e-mail dla wybranego adresata. Priority: must-have
  > Socrates: Counter-argument considered: nie wszystkie telefony mają skonfigurowany klient e-mail. Resolution: otwarcie wiadomości nie jest jedyną drogą; istnieje też kopiowanie treści.
- FR-005: Mieszkaniec może skopiować treść przygotowanej wiadomości, gdy klient e-mail nie jest dostępny. Priority: must-have
  > Socrates: Counter-argument considered: po skopiowaniu mieszkaniec może ręcznie zmienić wiadomość. Resolution: aplikacja nie weryfikuje ręcznych zmian dokonanych poza nią.
- FR-006: Administrator może zarządzać szablonami i adresatami zgłoszeń. Priority: must-have
  > Socrates: Counter-argument considered: edycja adresatów może spowodować przypadkowe skierowanie zgłoszeń na zły adres. Resolution: pojedynczy administrator może edytować adresatów bez dodatkowego zabezpieczenia w MVP.
- FR-007: Administrator może przeglądać anonimowe statystyki zgłoszeń. Priority: must-have
  > Socrates: Counter-argument considered: proste liczniki mogą nie pokazać wszystkich prawidłowości. Resolution: liczniki są funkcją dodatkową; na start wystarczają proste anonimowe statystyki, a priorytetem pozostaje zgłaszanie.

## Non-Functional Requirements

- Dane formularza nie opuszczają przeglądarki, poza wiadomością wysłaną samodzielnie przez mieszkańca.
- Aplikacja jest używalna w aktualnych przeglądarkach na Androidzie i iOS.
- Anonimowa statystyka pokazuje łączną liczbę zgłoszeń według adresata oraz timestamp zdarzenia.
- Reakcja strony na działanie użytkownika następuje w mniej niż 1 sekundę.

## Business Logic

Wybrany przycisk adresata determinuje przypisany szablon wiadomości — osobny dla ZUK i osobny dla burmistrza — a wartości z formularza są podstawiane do jego placeholderów.

## Access Control

- Mieszkaniec korzysta z publicznej części aplikacji anonimowo, bez konta i bez przekazywania danych identyfikujących.
- Jedno ręcznie utworzone konto administratora, uwierzytelniane loginem i hasłem, ma dostęp do panelu.
- Administrator przegląda statystyki zgłoszeń oraz edytuje szablony dla różnych adresatów. Szablony dla burmistrza i ZUK mogą mieć odrębny temat, treść i zestaw placeholderów.

## Product Framing

- Produkt: strona webowa przeznaczona głównie dla urządzeń mobilnych.
- Zakładana skala: do 100 użytkowników.
- Termin MVP: brak twardego terminu.
- Sposób pracy: częściowo po godzinach, częściowo w czasie pracy.

## Non-Goals

- MVP nie wysyła wiadomości samodzielnie; tylko otwiera klienta poczty albo umożliwia kopiowanie treści.
- MVP nie zapamiętuje danych mieszkańca ani nie tworzy kont mieszkańców.
- MVP nie pobiera danych pogodowych ani nie wykonuje zaawansowanej analizy statystyk.
- MVP nie obsługuje innych adresatów ani typów zgłoszeń poza ZUK i burmistrzem.
- MVP nie ocenia prawnej poprawności wiadomości ani nie gwarantuje reakcji instytucji.

## Open Questions

1. **Czy niewysyłanie i nieprzechowywanie danych formularza przez serwer aplikacji oznacza, że twórca nie jest administratorem danych?** — TBD by user; wymaga weryfikacji prawnej dla konkretnego wdrożenia.

## Quality cross-check

- Access Control: present.
- Business Logic: present as a one-sentence rule.
- Project artifacts: present.
- Timeline-cost acknowledged: present; MVP is scoped to one week.
- Non-Goals: present.
