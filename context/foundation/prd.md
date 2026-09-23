---
project: "Smród Miękinia"
version: 1
status: draft
created: 2026-09-16
context_type: greenfield
product_type: web-app
target_scale:
  users: medium
  qps: "# TODO: qps — see Open Questions"
  data_volume: "# TODO: data_volume — see Open Questions"
timeline_budget:
  mvp_weeks: 1
  hard_deadline: null
  after_hours_only: false
---

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

## Non-Goals

- MVP nie wysyła wiadomości samodzielnie; tylko otwiera klienta poczty albo umożliwia kopiowanie treści.
- MVP nie zapamiętuje danych mieszkańca ani nie tworzy kont mieszkańców.
- MVP nie pobiera danych pogodowych ani nie wykonuje zaawansowanej analizy statystyk.
- MVP nie obsługuje innych adresatów ani typów zgłoszeń poza ZUK i burmistrzem.
- MVP nie ocenia prawnej poprawności wiadomości ani nie gwarantuje reakcji instytucji.

## Open Questions

1. **Czy niewysyłanie i nieprzechowywanie danych formularza przez serwer aplikacji oznacza, że twórca nie jest administratorem danych?** — TBD by user; wymaga weryfikacji prawnej dla konkretnego wdrożenia.
2. **Jaka jest zakładana liczba żądań w jednostce czasu?** — TBD by user; potrzebne do uzupełnienia `target_scale.qps`.
3. **Jaki jest zakładany wolumen danych anonimowej statystyki?** — TBD by user; potrzebne do uzupełnienia `target_scale.data_volume`.
