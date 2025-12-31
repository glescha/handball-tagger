Här är en kort README-sektion du kan klistra in rakt av:


---

Android (Capacitor) – verifierad build

Status

✅ Android-app fungerar på fysisk platta

✅ Byggs automatiskt via GitHub Actions

✅ Debug-APK verifierad och körbar


Bygga Android APK via GitHub Actions

Workflow: Android Debug Build

Trigger:

Push till main, eller

Manuell körning via Actions → Android Debug Build


Resultat:

En debug-APK genereras och laddas upp som artefakt
(app-debug.apk)


Lokalt (utveckling)

npm ci
npm run build
npx cap sync android
cd android
./gradlew assembleDebug

Tekniska detaljer

Frontend: Vite + React

Wrapper: Capacitor

Java: Temurin JDK 21

Android build: Gradle (via assembleDebug)


Känd verifierad miljö

Android: fysisk platta (debug-APK)

Web: fungerande i Codespaces + lokal dev-server


> Obs: APK:n är debug och avsedd för test/utveckling, inte Play Store-distribution.




---

Vill du ha en ännu kortare version, eller en separat “Release notes”-sektion kopplad till din tag (v0.1.0)?
