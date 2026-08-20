import {CategoryId, LanguageId} from "./LingoSpaceData"

export type LingoCopyKey =
  | "nativePrompt" | "nativeMascot" | "targetPrompt" | "targetMascot"
  | "modePrompt" | "imageMode" | "imageModeHint" | "scanMode" | "scanModeHint"
  | "ready" | "readyHint" | "start" | "back" | "listen" | "holdToTalk"
  | "scanAgain" | "scanPrompt" | "scanning" | "cameraUnavailable" | "internetScan"
  | "scanFailed" | "savedCards" | "illustrationsReady" | "practiceSaved"
  | "listenPhrase" | "listenThenRepeat" | "nothingReady" | "voiceNeedsInternet"
  | "voiceFailed" | "listening" | "releaseToStop" | "finishing" | "nothingHeard"
  | "evaluating" | "organized" | "words" | "audioXp" | "textXp" | "totalXp"
  | "complete" | "nextWords" | "changeSetup" | "guideTitle" | "usage"

const COPY: Record<LanguageId, Record<LingoCopyKey, string>> = {
  Spanish: {
    nativePrompt: "¡Hola! ¿Cuál es tu\nidioma materno? ♡", nativeMascot: "TU MUNDO\nEMPIEZA AQUÍ",
    targetPrompt: "¿Qué idioma quieres\npracticar? ♡", targetMascot: "ELIGE TU\nPRÓXIMA AVENTURA",
    modePrompt: "¿Cómo quieres\npracticar hoy? ✦", imageMode: "TARJETAS CON IA", imageModeHint: "Vocabulario cotidiano ilustrado",
    scanMode: "ESCANEAR MI MUNDO", scanModeHint: "Guía para situaciones reales", ready: "LISTO PARA EXPLORAR TU MUNDO",
    readyHint: "Escucha, habla y recibe ayuda en situaciones reales.", start: "EMPEZAR", back: "VOLVER", listen: "ESCUCHAR",
    holdToTalk: "MANTÉN PARA HABLAR", scanAgain: "ESCANEAR DE NUEVO", scanPrompt: "Escanea el lugar para recibir frases útiles.",
    scanning: "ANALIZANDO EL ENTORNO…", cameraUnavailable: "CÁMARA NO DISPONIBLE", internetScan: "CONECTA INTERNET PARA ESCANEAR",
    scanFailed: "NO PUDE RECONOCER LA SITUACIÓN", savedCards: "TARJETAS GUARDADAS", illustrationsReady: "ILUSTRACIONES LISTAS",
    practiceSaved: "PRACTICAR TARJETAS GUARDADAS", listenPhrase: "Escucha la frase completa y luego practícala.",
    listenThenRepeat: "Ahora mantén el micrófono y repítela.", nothingReady: "Primero crea o muestra una tarjeta.",
    voiceNeedsInternet: "La voz necesita conexión a internet.", voiceFailed: "Falló la reproducción. Intenta de nuevo.",
    listening: "Escuchando", releaseToStop: "Escuchando… suelta para terminar", finishing: "Terminando la transcripción…",
    nothingHeard: "No escuché nada. Mantén el botón, habla y suelta.", evaluating: "evaluando…", organized: "organizadas",
    words: "palabras", audioXp: "XP AUDIO", textXp: "XP TEXTO", totalXp: "XP TOTAL", complete: "¡MISIÓN COMPLETADA!",
    nextWords: "SIGUIENTES PALABRAS", changeSetup: "CAMBIAR IDIOMAS", guideTitle: "GUÍA PARA ESTA SITUACIÓN", usage: "CÓMO USARLA",
  },
  English: {
    nativePrompt: "Hi! What’s your\nnative language? ♡", nativeMascot: "YOUR WORLD\nSTARTS HERE",
    targetPrompt: "Which language do you\nwant to practice? ♡", targetMascot: "PICK YOUR\nNEXT ADVENTURE",
    modePrompt: "How do you want\nto practice today? ✦", imageMode: "AI IMAGE CARDS", imageModeHint: "Illustrated everyday vocabulary",
    scanMode: "SCAN MY WORLD", scanModeHint: "Guidance for real situations", ready: "READY TO EXPLORE YOUR WORLD",
    readyHint: "Listen, speak and get help in real situations.", start: "START", back: "BACK", listen: "LISTEN",
    holdToTalk: "HOLD TO TALK", scanAgain: "SCAN AGAIN", scanPrompt: "Scan the place around you to receive useful phrases.",
    scanning: "ANALYZING YOUR SURROUNDINGS…", cameraUnavailable: "CAMERA UNAVAILABLE", internetScan: "CONNECT TO THE INTERNET TO SCAN",
    scanFailed: "I COULDN’T RECOGNIZE THE SITUATION", savedCards: "OBJECT CARDS SAVED", illustrationsReady: "ILLUSTRATIONS READY",
    practiceSaved: "PRACTICE SAVED CARDS", listenPhrase: "Listen to the complete phrase, then practice it.",
    listenThenRepeat: "Now hold the mic and repeat it.", nothingReady: "Create or reveal a card first.",
    voiceNeedsInternet: "Voice playback needs internet.", voiceFailed: "Voice playback failed. Try again.",
    listening: "Listening", releaseToStop: "Listening… release to stop", finishing: "Finishing transcription…",
    nothingHeard: "Nothing heard. Hold the button, speak, then release.", evaluating: "evaluating…", organized: "organized",
    words: "words", audioXp: "AUDIO XP", textXp: "TEXT XP", totalXp: "TOTAL XP", complete: "MISSION COMPLETE!",
    nextWords: "NEXT WORDS", changeSetup: "CHANGE LANGUAGES", guideTitle: "GUIDE FOR THIS SITUATION", usage: "HOW TO USE IT",
  },
  German: {
    nativePrompt: "Hallo! Was ist deine\nMuttersprache? ♡", nativeMascot: "DEINE WELT\nBEGINNT HIER",
    targetPrompt: "Welche Sprache möchtest\ndu üben? ♡", targetMascot: "WÄHLE DEIN\nNÄCHSTES ABENTEUER",
    modePrompt: "Wie möchtest du\nheute üben? ✦", imageMode: "KI-BILDKARTEN", imageModeHint: "Illustrierter Alltagswortschatz",
    scanMode: "MEINE WELT SCANNEN", scanModeHint: "Hilfe für echte Situationen", ready: "BEREIT, DEINE WELT ZU ERKUNDEN",
    readyHint: "Höre, sprich und erhalte Hilfe in echten Situationen.", start: "START", back: "ZURÜCK", listen: "ANHÖREN",
    holdToTalk: "ZUM SPRECHEN HALTEN", scanAgain: "ERNEUT SCANNEN", scanPrompt: "Scanne den Ort für nützliche Sätze.",
    scanning: "UMGEBUNG WIRD ANALYSIERT…", cameraUnavailable: "KAMERA NICHT VERFÜGBAR", internetScan: "ZUM SCANNEN MIT INTERNET VERBINDEN",
    scanFailed: "SITUATION NICHT ERKANNT", savedCards: "KARTEN GESPEICHERT", illustrationsReady: "ILLUSTRATIONEN BEREIT",
    practiceSaved: "GESPEICHERTE KARTEN ÜBEN", listenPhrase: "Höre den ganzen Satz und übe ihn dann.", listenThenRepeat: "Halte jetzt das Mikrofon und wiederhole.",
    nothingReady: "Erstelle oder zeige zuerst eine Karte.", voiceNeedsInternet: "Sprachausgabe benötigt Internet.", voiceFailed: "Wiedergabe fehlgeschlagen. Noch einmal.",
    listening: "Ich höre", releaseToStop: "Ich höre… zum Beenden loslassen", finishing: "Transkription wird beendet…", nothingHeard: "Nichts gehört. Halten, sprechen, loslassen.",
    evaluating: "wird bewertet…", organized: "sortiert", words: "Wörter", audioXp: "AUDIO-XP", textXp: "TEXT-XP", totalXp: "GESAMT-XP",
    complete: "MISSION ERFÜLLT!", nextWords: "NÄCHSTE WÖRTER", changeSetup: "SPRACHEN ÄNDERN", guideTitle: "HILFE FÜR DIESE SITUATION", usage: "SO VERWENDEST DU ES",
  },
  French: {
    nativePrompt: "Bonjour ! Quelle est ta\nlangue maternelle ? ♡", nativeMascot: "TON MONDE\nCOMMENCE ICI",
    targetPrompt: "Quelle langue veux-tu\npratiquer ? ♡", targetMascot: "CHOISIS TA\nPROCHAINE AVENTURE",
    modePrompt: "Comment veux-tu\nt’entraîner aujourd’hui ? ✦", imageMode: "CARTES IMAGE IA", imageModeHint: "Vocabulaire quotidien illustré",
    scanMode: "SCANNER MON MONDE", scanModeHint: "Guide pour situations réelles", ready: "PRÊT À EXPLORER TON MONDE",
    readyHint: "Écoute, parle et reçois de l’aide en situation réelle.", start: "COMMENCER", back: "RETOUR", listen: "ÉCOUTER",
    holdToTalk: "MAINTENIR POUR PARLER", scanAgain: "SCANNER ENCORE", scanPrompt: "Scanne le lieu pour obtenir des phrases utiles.",
    scanning: "ANALYSE DE L’ENVIRONNEMENT…", cameraUnavailable: "CAMÉRA INDISPONIBLE", internetScan: "CONNECTE-TOI POUR SCANNER",
    scanFailed: "SITUATION NON RECONNUE", savedCards: "CARTES ENREGISTRÉES", illustrationsReady: "ILLUSTRATIONS PRÊTES",
    practiceSaved: "PRATIQUER LES CARTES", listenPhrase: "Écoute la phrase complète, puis entraîne-toi.", listenThenRepeat: "Maintenant, maintiens le micro et répète.",
    nothingReady: "Crée ou affiche d’abord une carte.", voiceNeedsInternet: "La voix nécessite internet.", voiceFailed: "Échec de la lecture. Réessaie.",
    listening: "Écoute", releaseToStop: "Écoute… relâche pour terminer", finishing: "Fin de la transcription…", nothingHeard: "Rien entendu. Maintiens, parle, puis relâche.",
    evaluating: "évaluation…", organized: "organisées", words: "mots", audioXp: "XP AUDIO", textXp: "XP TEXTE", totalXp: "XP TOTAL",
    complete: "MISSION ACCOMPLIE !", nextWords: "MOTS SUIVANTS", changeSetup: "CHANGER LES LANGUES", guideTitle: "GUIDE POUR CETTE SITUATION", usage: "COMMENT L’UTILISER",
  },
  Italian: {
    nativePrompt: "Ciao! Qual è la tua\nlingua madre? ♡", nativeMascot: "IL TUO MONDO\nINIZIA QUI",
    targetPrompt: "Quale lingua vuoi\npraticare? ♡", targetMascot: "SCEGLI LA TUA\nPROSSIMA AVVENTURA",
    modePrompt: "Come vuoi esercitarti\noggi? ✦", imageMode: "CARTE IMMAGINE IA", imageModeHint: "Vocabolario quotidiano illustrato",
    scanMode: "SCANSIONA IL MIO MONDO", scanModeHint: "Guida per situazioni reali", ready: "PRONTO A ESPLORARE IL TUO MONDO",
    readyHint: "Ascolta, parla e ricevi aiuto in situazioni reali.", start: "INIZIA", back: "INDIETRO", listen: "ASCOLTA",
    holdToTalk: "TIENI PREMUTO PER PARLARE", scanAgain: "SCANSIONA ANCORA", scanPrompt: "Scansiona il luogo per ricevere frasi utili.",
    scanning: "ANALISI DELL’AMBIENTE…", cameraUnavailable: "FOTOCAMERA NON DISPONIBILE", internetScan: "CONNETTITI PER SCANSIONARE",
    scanFailed: "SITUAZIONE NON RICONOSCIUTA", savedCards: "CARTE SALVATE", illustrationsReady: "ILLUSTRAZIONI PRONTE",
    practiceSaved: "ESERCITATI CON LE CARTE", listenPhrase: "Ascolta la frase completa, poi esercitati.", listenThenRepeat: "Ora tieni premuto il microfono e ripeti.",
    nothingReady: "Prima crea o mostra una carta.", voiceNeedsInternet: "La voce richiede internet.", voiceFailed: "Riproduzione non riuscita. Riprova.",
    listening: "In ascolto", releaseToStop: "In ascolto… rilascia per terminare", finishing: "Trascrizione in chiusura…", nothingHeard: "Non ho sentito nulla. Tieni premuto, parla e rilascia.",
    evaluating: "valutazione…", organized: "organizzate", words: "parole", audioXp: "XP AUDIO", textXp: "XP TESTO", totalXp: "XP TOTALE",
    complete: "MISSIONE COMPLETATA!", nextWords: "PAROLE SUCCESSIVE", changeSetup: "CAMBIA LINGUE", guideTitle: "GUIDA PER QUESTA SITUAZIONE", usage: "COME USARLA",
  },
  Japanese: {
    nativePrompt: "こんにちは！母語は\n何ですか？ ♡", nativeMascot: "あなたの世界は\nここから始まる",
    targetPrompt: "どの言語を\n練習しますか？ ♡", targetMascot: "次の冒険を\n選ぼう",
    modePrompt: "今日はどうやって\n練習しますか？ ✦", imageMode: "AI画像カード", imageModeHint: "日常単語をイラストで練習",
    scanMode: "世界をスキャン", scanModeHint: "実際の場面で使えるガイド", ready: "世界を探検する準備完了",
    readyHint: "聞いて、話して、実際の場面でサポートを受けよう。", start: "スタート", back: "戻る", listen: "聞く",
    holdToTalk: "長押しして話す", scanAgain: "もう一度スキャン", scanPrompt: "場所をスキャンして便利なフレーズを表示します。",
    scanning: "周囲を分析中…", cameraUnavailable: "カメラを使用できません", internetScan: "スキャンにはインターネットが必要です",
    scanFailed: "状況を認識できませんでした", savedCards: "カードを保存しました", illustrationsReady: "イラスト準備完了",
    practiceSaved: "保存したカードを練習", listenPhrase: "フレーズ全体を聞いてから練習しましょう。", listenThenRepeat: "マイクを長押しして繰り返してください。",
    nothingReady: "最初にカードを作成または表示してください。", voiceNeedsInternet: "音声にはインターネットが必要です。", voiceFailed: "再生できませんでした。もう一度試してください。",
    listening: "聞き取り中", releaseToStop: "聞き取り中…離すと終了", finishing: "文字起こしを完了中…", nothingHeard: "聞き取れませんでした。長押しして話し、離してください。",
    evaluating: "評価中…", organized: "整理済み", words: "語", audioXp: "音声XP", textXp: "テキストXP", totalXp: "合計XP",
    complete: "ミッション完了！", nextWords: "次の単語", changeSetup: "言語を変更", guideTitle: "この場面のガイド", usage: "使い方",
  },
}

const LANGUAGE_NAMES: Record<LanguageId, Record<LanguageId, string>> = {
  Spanish: {Spanish: "Español", English: "Inglés", German: "Alemán", French: "Francés", Italian: "Italiano", Japanese: "Japonés"},
  English: {Spanish: "Spanish", English: "English", German: "German", French: "French", Italian: "Italian", Japanese: "Japanese"},
  German: {Spanish: "Spanisch", English: "Englisch", German: "Deutsch", French: "Französisch", Italian: "Italienisch", Japanese: "Japanisch"},
  French: {Spanish: "Espagnol", English: "Anglais", German: "Allemand", French: "Français", Italian: "Italien", Japanese: "Japonais"},
  Italian: {Spanish: "Spagnolo", English: "Inglese", German: "Tedesco", French: "Francese", Italian: "Italiano", Japanese: "Giapponese"},
  Japanese: {Spanish: "スペイン語", English: "英語", German: "ドイツ語", French: "フランス語", Italian: "イタリア語", Japanese: "日本語"},
}

const CATEGORY_NAMES: Record<LanguageId, Record<CategoryId, string>> = {
  Spanish: {HOME: "HOGAR", FOOD: "COMIDA", WORK: "TRABAJO", TRAVEL: "VIAJES", PEOPLE: "PERSONAS", OUTSIDE: "EXTERIOR"},
  English: {HOME: "HOME", FOOD: "FOOD", WORK: "WORK", TRAVEL: "TRAVEL", PEOPLE: "PEOPLE", OUTSIDE: "OUTSIDE"},
  German: {HOME: "ZUHAUSE", FOOD: "ESSEN", WORK: "ARBEIT", TRAVEL: "REISEN", PEOPLE: "MENSCHEN", OUTSIDE: "DRAUSSEN"},
  French: {HOME: "MAISON", FOOD: "REPAS", WORK: "TRAVAIL", TRAVEL: "VOYAGE", PEOPLE: "PERSONNES", OUTSIDE: "DEHORS"},
  Italian: {HOME: "CASA", FOOD: "CIBO", WORK: "LAVORO", TRAVEL: "VIAGGI", PEOPLE: "PERSONE", OUTSIDE: "ESTERNO"},
  Japanese: {HOME: "家", FOOD: "食べ物", WORK: "仕事", TRAVEL: "旅行", PEOPLE: "人", OUTSIDE: "屋外"},
}

export function lingoCopy(language: LanguageId | null | undefined, key: LingoCopyKey): string {
  return COPY[language || "English"][key]
}

export function languageName(language: LanguageId, displayLanguage: LanguageId | null | undefined): string {
  return LANGUAGE_NAMES[displayLanguage || "English"][language]
}

export function categoryName(category: CategoryId, displayLanguage: LanguageId | null | undefined): string {
  return CATEGORY_NAMES[displayLanguage || "English"][category]
}
