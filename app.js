import {
    FaceLandmarker,
    FilesetResolver
} from "/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs";


/* ============================================================
   ELEMENTS
============================================================ */

const video =
    document.getElementById("camera");

const canvas =
    document.getElementById("overlay");

const ctx =
    canvas.getContext("2d");

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const status =
    document.getElementById("status");

const countdown =
    document.getElementById("countdown");

const countdownNumber =
    document.getElementById("countdownNumber");

const roastPanel =
    document.getElementById("roastPanel");

const expressionText =
    document.getElementById("expression");

const roastText =
    document.getElementById("roast");


/* ============================================================
   VARIABLES
============================================================ */

let faceLandmarker = null;

let running = false;

let analysisStartTime = null;

let lockedExpression = null;

let expressionHistory = [];

let candidateExpression = null;

let candidateStartTime = null;


/* ============================================================
   SETTINGS
============================================================ */

const ANALYSIS_TIME = 5000;

const EXPRESSION_CHANGE_TIME = 2000;


/* ============================================================
   EXPRESSION EMOJIS
============================================================ */

const EXPRESSION_EMOJIS = {

    HAPPY: "😁",

    SERIOUS: "😎",

    SURPRISED: "😮",

    SHOCKED: "😲",

    BIG_SMILE: "😁",

    SMIRK: "😏",

    BORED: "😴",

    SUSPICIOUS: "🤨",

    SHY: "😳",

    LAUGHING: "😂",

    SLEEPY: "😴"

};


/* ============================================================
   ROASTS
============================================================ */

const ROASTS = {

    HAPPY: [
        "😁 ಅಯ್ಯೋ ಬ್ರೋ, ಇವತ್ತು ಫುಲ್ ಹ್ಯಾಪಿ ಮೋಡ್‌ನಲ್ಲಿ ಇದ್ದೀಯಾ! 🎉",
        "😂 ನಿನ್ನ ಸ್ಮೈಲ್ ನೋಡಿದ್ರೆ ಎಕ್ಸಾಮ್ ರಿಸಲ್ಟ್ ಈಗಾಗಲೇ ಬಂದಿದೆ ಅನ್ಸುತ್ತೆ! 📚",
        "😄 ಏನ್ ಗುರು, ಲೈಫ್‌ನಲ್ಲಿ ಏನೋ ಜಾಕ್‌ಪಾಟ್ ಸಿಕ್ಕಿದಂಗೆ ಸ್ಮೈಲ್ ಮಾಡ್ತಿದ್ದೀಯಾ! 💰",
        "🤣 ಬ್ರೋ, ಇಷ್ಟು ಖುಷಿ ಯಾಕೆ? ಲಾಟರಿ ಹೊಡ್ದಿದ್ಯಾ? 🎰",
        "😎 ಗುರು, ನಿನ್ನ ಮುಖ ನೋಡಿದ್ರೆ ಸೋಮವಾರ ಕೂಡ ಭಾನುವಾರ ಅನ್ಸುತ್ತೆ! ☀️",
        "😁 ಅಯ್ಯೋ ಬ್ರೋ, ಈ ಸ್ಮೈಲ್‌ಗೆ ಇಷ್ಟು ಪವರ್ ಎಲ್ಲಿಂದ ಬಂತು? ⚡",
        "😂 ನಿನ್ನ ಫೇಸ್ ನೋಡಿದ್ರೆ ಟೆನ್ಷನ್ ಅನ್ನೋ ಪದವೇ ಗೊತ್ತಿಲ್ಲ ಅನ್ಸುತ್ತೆ! 😌",
        "😄 ಗುರು, ಇವತ್ತು ಯಾರಾದ್ರೂ ನಿನಗೆ ಫ್ರೀ ವೈಫೈ ಕೊಟ್ಟ್ರಾ? 📶",
        "😉 ಬ್ರೋ, ಈ ಸ್ಮೈಲ್ ನೋಡಿದ್ರೆ ಏನೋ ಸೀಕ್ರೆಟ್ ಗುಡ್ ನ್ಯೂಸ್ ಇದೆ! 📰",
        "🤣 ಅಯ್ಯೋ, ಮುಖದಲ್ಲಿ ಇಷ್ಟು ಖುಷಿ... ಏನೋ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ತೆಗೆಯಬೇಕು ಅನ್ಸುತ್ತೆ! 📸",
        "😁 ಗುರು, ನಿನ್ನ ಸ್ಮೈಲ್ ನೋಡಿದ್ರೆ ಲೈಫ್ ಸೆಟ್ ಆಗಿದೆ ಅನ್ಸುತ್ತೆ! ✨",
        "😆 ಬ್ರೋ, ಇವತ್ತು ನಿನ್ನ ಮುಖಕ್ಕೆ ಬ್ರೈಟ್‌ನೆಸ್ 100% ಇದೆ! 🔆",
        "😉 ಏನ್ ಗುರು, ಕ್ರಷ್ ಮೆಸೇಜ್ ಮಾಡಿದ್ಲಾ? 💌",
        "😂 ಬ್ರೋ, ಈ ನಗು ನೋಡಿದ್ರೆ ಫೋನ್ ಬ್ಯಾಟರಿ ಕೂಡ ಫುಲ್ ಆಗುತ್ತೆ! 🔋",
        "😄 ಅಯ್ಯೋ ಗುರು, ನಿನ್ನ ಖುಷಿ ನೋಡಿದ್ರೆ ನಮಗೂ ಖುಷಿ ಆಗ್ತಿದೆ! ❤️",
        "😁 ಬ್ರೋ, ನಿನ್ನ ಮುಖ ಇವತ್ತು ಫುಲ್ ಫೆಸ್ಟಿವಲ್ ಮೂಡ್‌ನಲ್ಲಿ ಇದೆ! 🎊",
        "🤣 ಗುರು, ಇಷ್ಟು ಸ್ಮೈಲ್ ಮಾಡಿದ್ರೆ ಕ್ಯಾಮೆರಾನೇ ಶರ್ಮಾ ಆಗುತ್ತೆ! 📷",
        "😎 ಬ್ರೋ, ಏನೋ ದೊಡ್ಡ ವಿಷಯ ಗೆದ್ದಂಗೆ ಫುಲ್ ಖುಷಿಯಾಗಿದ್ದೀಯಾ! 🏆",
        "😂 ಅಯ್ಯೋ ಬ್ರೋ, ಈ ನಗುವಿಗೆ ಕಾರಣ ಹೇಳು, ನಮಗೂ ತಿಳ್ಕೋಬೇಕು! 👀"
    ],

    SERIOUS: [
        "😐 ಬ್ರೋ, ಫೇಸ್ ನೋಡಿದ್ರೆ ಇವತ್ತು ಯಾರಿಗೂ ರಿಪ್ಲೈ ಕೊಡಲ್ಲ ಅನ್ಸುತ್ತೆ! 🚫",
        "😎 ಗುರು, ಫುಲ್ ಸೀರಿಯಸ್ ಮೋಡ್‌ನಲ್ಲಿ ಇದ್ದೀಯಾ... ಏನೋ ಬಿಗ್ ಮೀಟಿಂಗ್ ಆ? 💼",
        "🧐 ಬ್ರೋ, ಕ್ಯಾಮೆರಾಗೆ ನೋಡೋದು ಅಲ್ಲ, ಕ್ಯಾಮೆರಾನೇ ಇಂಟರ್ರೊಗೇಟ್ ಮಾಡ್ತಿದ್ದೀಯಾ! 📷",
        "😐 ಗುರು, ನಿನ್ನ ಫೇಸ್ ನೋಡಿದ್ರೆ ಪ್ರಿನ್ಸಿಪಾಲ್ ಕೂಡ ಹೆದರಬೇಕು! 😨",
        "😑 ಬ್ರೋ, ಏನಾಯ್ತು? ಜೀವನದ ಎಲ್ಲಾ ಸಮಸ್ಯೆಗಳನ್ನು ಒಂದೇ ಸಲ ನೆನಪಿಸಿಕೊಂಡಿಯಾ? 🧠",
        "🙄 ಗುರು, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ 'ನನ್ನ ಜೊತೆ ಮಾತಾಡ್ಬೇಡ' ಅಂತ ಬೋರ್ಡ್ ಹಾಕಿದಂಗೆ ಇದೆ! 🚫",
        "😐 ಬ್ರೋ, ಇಷ್ಟು ಸೀರಿಯಸ್ ಯಾಕೆ? ಬಿಲ್ ಕಟ್ಟಬೇಕಾ? 💸",
        "🧐 ಗುರು, ನಿನ್ನ ಮುಖ ಈಗ ಮೀಟಿಂಗ್ ರೂಮ್ ವೈಬ್ ಕೊಡ್ತಿದೆ! 💼",
        "😎 ಬ್ರೋ, ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಇದ್ದೀಯಾ ಅಥವಾ ಕೋರ್ಟ್‌ನಲ್ಲಿ ಜಡ್ಜ್ ಆಗಿದ್ದೀಯಾ? ⚖️",
        "😂 ಅಯ್ಯೋ ಗುರು, ಒಂದು ಸ್ಮೈಲ್ ಮಾಡು... ಕ್ಯಾಮೆರಾ ಹೆದರುತ್ತಿದೆ! 📸",
        "😑 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್‌ನಲ್ಲಿ ಸೀರಿಯಸ್‌ನೆಸ್ ಓವರ್‌ಲೋಡ್ ಆಗಿದೆ! ⚠️",
        "🧐 ಗುರು, ಈ ಲುಕ್ ನೋಡಿದ್ರೆ ಏನೋ ದೊಡ್ಡ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳ್ತಿದ್ದೀಯಾ ಅನ್ಸುತ್ತೆ! 🤔",
        "😐 ಬ್ರೋ, ಫುಲ್ ಸೀರಿಯಸ್... ಆದರೆ ಕಾರಣ ಮಾತ್ರ ಯಾರಿಗೂ ಗೊತ್ತಿಲ್ಲ! ❓",
        "🎬 ಗುರು, ಈ ಮುಖಕ್ಕೆ ಬ್ಯಾಕ್‌ಗ್ರೌಂಡ್‌ನಲ್ಲಿ ಸೀರಿಯಸ್ ಮ್ಯೂಸಿಕ್ ಬೇಕು! 🎵",
        "😎 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್ ನೋಡಿದ್ರೆ ಕಾಮಿಡಿ ಕೂಡ ಸೀರಿಯಸ್ ಆಗುತ್ತೆ! 😂",
        "😅 ಅಯ್ಯೋ ಗುರು, ಸ್ವಲ್ಪ ರಿಲ್ಯಾಕ್ಸ್ ಆಗು... ಕ್ಯಾಮೆರಾ ನಿನ್ನ ಮೇಲೆ ಕೇಸ್ ಹಾಕಲ್ಲ! 📷",
        "😐 ಬ್ರೋ, ಈ ಎಕ್ಸ್‌ಪ್ರೆಶನ್‌ಗೆ 'ನೋ ಫನ್ನಿ ಬಿಸಿನೆಸ್' ಅಂತ ಹೆಸರು ಇಡಬೇಕು! 🚫",
        "🧑‍💼 ಗುರು, ನಿನ್ನ ಮುಖ ಈಗ ಆಫೀಸ್ ಬಾಸ್ ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! 💼",
        "😎 ಬ್ರೋ, ಇಷ್ಟು ಸೀರಿಯಸ್ ಆಗಿದ್ರೆ AI ಕೂಡ ರೆಸ್ಪೆಕ್ಟ್ ಕೊಡಬೇಕು! 🤖",
        "😐 ಗುರು, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ ಇವತ್ತು ಫುಲ್ ಡಿಸಿಪ್ಲಿನ್ ಡೇ ಅನ್ಸುತ್ತೆ! 📋"
    ],

    SURPRISED: [
        "😮 ಅಯ್ಯೋ ಗುರು, ಏನ್ ನೋಡಿದೆ? ಫುಲ್ ಶಾಕ್ ಆಗ್ಬಿಟ್ಟೆ! 😳",
        "😲 ಬ್ರೋ, ಅಸೈನ್‌ಮೆಂಟ್ ಡೆಡ್‌ಲೈನ್ ನೆನಪಾಯ್ತಾ? 📚",
        "😮 ಏನ್ ಗುರು, ಈ ರಿಯಾಕ್ಷನ್‌ಗೆ ರೀಸನ್ ಏನು? ಫುಲ್ ಅನ್‌ಎಕ್ಸ್‌ಪೆಕ್ಟೆಡ್! 🤯",
        "😳 ಬ್ರೋ, ನಿನ್ನ ಕಣ್ಣುಗಳು 'ಇದು ನಿಜಾನಾ?' ಅಂತ ಕೇಳ್ತಿವೆ! 👀",
        "😲 ಗುರು, ಏನೋ ದೊಡ್ಡ ಸೀಕ್ರೆಟ್ ರಿವೀಲ್ ಆದಂಗೆ ಇದೆ! 🤫",
        "😮 ಅಯ್ಯೋ ಬ್ರೋ, ಹೀಗೆ ನೋಡಿದ್ರೆ ಕ್ಯಾಮೆರಾ ಕೂಡ ಕನ್‌ಫ್ಯೂಸ್ ಆಗುತ್ತೆ! 📷",
        "😳 ಬ್ರೋ, ಏನಾಯ್ತು? ಫೋನ್‌ನಲ್ಲಿ ಶಾಕಿಂಗ್ ಮೆಸೇಜ್ ಬಂತಾ? 📱",
        "😲 ಗುರು, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ ನೀನು ಈಗಷ್ಟೇ ದೊಡ್ಡ ನ್ಯೂಸ್ ಕೇಳಿದಿಯಾ ಅನ್ಸುತ್ತೆ! 📰",
        "😮 ಬ್ರೋ, ಇಷ್ಟು ಸರ್ಪ್ರೈಸ್ ಯಾಕೆ? ಚಾಕೊಲೇಟ್ ಸಿಕ್ಕಿತಾ? 🍫",
        "😳 ಅಯ್ಯೋ ಗುರು, ಕಣ್ಣುಗಳು ಫುಲ್ ವೈಡ್ ಓಪನ್ ಆಗಿವೆ! 👀",
        "😲 ಬ್ರೋ, ನಿನ್ನ ರಿಯಾಕ್ಷನ್ ನೋಡಿದ್ರೆ ಏನೋ ಫಿಲ್ಮ್ ಟ್ವಿಸ್ಟ್ ಬಂದಿದೆ ಅನ್ಸುತ್ತೆ! 🎬",
        "😮 ಗುರು, ಯಾರಾದ್ರೂ 'ನಾಳೆ ರಜೆ' ಅಂತ ಹೇಳಿದ್ರಾ? 🎉",
        "🤣 ಬ್ರೋ, ಈ ಸರ್ಪ್ರೈಸ್ ಫೇಸ್‌ಗೆ ಆಕ್ಷನ್ ಮೂವಿ ಕೂಡ ಸಣ್ಣದಾಗಿ ಕಾಣುತ್ತೆ! 🎬",
        "😳 ಅಯ್ಯೋ, ನಿನ್ನ ಮುಖ ಈಗ 'ಏನಿದು?' ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! ❓",
        "😲 ಗುರು, ಏನೋ ನಂಬಲಾಗದ ವಿಷಯ ನೋಡಿದಂಗೆ ಇದ್ದೀಯಾ! 🤯",
        "😮 ಬ್ರೋ, ಕ್ಯಾಮೆರಾ ನೋಡಿದಿಯಾ ಅಥವಾ ಭೂತ ನೋಡಿದಿಯಾ? 👻",
        "🧐 ಗುರು, ಈ ಎಕ್ಸ್‌ಪ್ರೆಶನ್‌ಗೆ ಒಂದು ದೊಡ್ಡ ಪ್ರಶ್ನಾರ್ಥಕ ಚಿಹ್ನೆ ಬೇಕು! ❓",
        "😳 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್ ಹೇಳ್ತಿದೆ — 'ನನಗೆ ಏನೂ ಅರ್ಥ ಆಗ್ತಿಲ್ಲ!' 🤷",
        "😲 ಅಯ್ಯೋ ಗುರು, ಇಷ್ಟು ಸರ್ಪ್ರೈಸ್ ನೋಡಿದ್ರೆ ನಮಗೂ ಕುತೂಹಲ ಬರುತ್ತೆ! 👀",
        "🤯 ಬ್ರೋ, ಏನೋ ದೊಡ್ಡ ಟ್ವಿಸ್ಟ್ ನಡೆದಿದೆ ಅನ್ಸುತ್ತೆ! 🎬"
    ],

    SHOCKED: [
        "😱 ಅಯ್ಯೋ ಬ್ರೋ, ಕರೆಂಟ್ ಬಿಲ್ ನೋಡಿದಿಯಾ? 💸",
        "😨 ಗುರು, ವೈಫೈ ಡಿಸ್ಕನೆಕ್ಟ್ ಆಯ್ತಾ? ಫೇಸ್ ಫುಲ್ ಶಾಕ್ ಇದೆ! 📶",
        "😱 ಬ್ರೋ, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ ಏನೋ ಶಾಕಿಂಗ್ ನ್ಯೂಸ್ ಸಿಕ್ಕಿದೆ ಅನ್ಸುತ್ತೆ! 📰",
        "😳 ಅಯ್ಯೋ ಗುರು, ಇಷ್ಟು ಶಾಕ್ ಯಾಕೆ? ಎಕ್ಸಾಮ್ ರಿಸಲ್ಟ್ ನೋಡಿದಿಯಾ? 📚",
        "😱 ಬ್ರೋ, ನಿನ್ನ ಮುಖ ಈಗ ಫುಲ್ ಬ್ರೇಕಿಂಗ್ ನ್ಯೂಸ್ ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! 🚨",
        "😨 ಗುರು, ಏನೋ ಭಯಂಕರ ಸರ್ಪ್ರೈಸ್ ಸಿಕ್ಕಿದಂಗೆ ಕಾಣ್ತಿದೆ! 😱",
        "😲 ಬ್ರೋ, ನಿನ್ನ ಕಣ್ಣುಗಳು ಬೇರೆ ಲೆವೆಲ್‌ನಲ್ಲಿ ಶಾಕ್ ಆಗಿವೆ! 👀",
        "😱 ಅಯ್ಯೋ, ಏನಾಯ್ತು ಗುರು? ಫೋನ್ ಬಿದ್ದು ಹೋಯ್ತಾ? 📱",
        "⚡ ಬ್ರೋ, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ ವಿದ್ಯುತ್ ಶಾಕ್ ಹೊಡೆದಂಗೆ ಇದೆ! 😵",
        "😳 ಗುರು, ಯಾರಾದ್ರೂ ನಿನ್ನ ಸೀಕ್ರೆಟ್ ಹಿಡಿದ್ರಾ? 🤫",
        "😱 ಅಯ್ಯೋ ಬ್ರೋ, ನಿನ್ನ ಮುಖವೇ 'ಅಯ್ಯೋ ದೇವ್ರೇ!' ಅಂತ ಹೇಳ್ತಿದೆ! 🙏",
        "😨 ಗುರು, ಇಷ್ಟು ಶಾಕ್ ಅಂದ್ರೆ ಏನೋ ದೊಡ್ಡ ಅನಾಹುತ ಅನ್ಸುತ್ತೆ! 🚨",
        "😱 ಬ್ರೋ, ನಿನ್ನ ರಿಯಾಕ್ಷನ್ ನೋಡಿದ್ರೆ ಸಿನಿಮಾ ಕ್ಲೈಮ್ಯಾಕ್ಸ್ ಶುರುವಾಗಿದೆ! 🎬",
        "😮 ಅಯ್ಯೋ ಗುರು, ಸ್ವಲ್ಪ ಉಸಿರು ತಗೋ... ಎಲ್ಲವೂ ಓಕೆ! 😅",
        "🚨 ಬ್ರೋ, ಈ ಶಾಕ್ ಫೇಸ್‌ಗೆ ಎಮರ್ಜೆನ್ಸಿ ಅಲಾರಂ ಬೇಕು! 🔔",
        "😱 ಗುರು, ಏನೋ ಅನ್‌ಎಕ್ಸ್‌ಪೆಕ್ಟೆಡ್ ಆಗಿ ನಿನ್ನ ಮುಂದೆ ಬಿದ್ದಂಗೆ ಇದೆ! 💥",
        "😨 ಬ್ರೋ, ನಿನ್ನ ಮುಖ ಈಗ 'ನಾನು ಇದನ್ನ ನೋಡಬಾರದಿತ್ತು' ಅಂತ ಹೇಳ್ತಿದೆ! 🙈",
        "😱 ಅಯ್ಯೋ ಗುರು, ಇಷ್ಟು ಶಾಕ್ ಆಗಿದ್ರೆ ಕ್ಯಾಮೆರಾ ಕೂಡ ಕ್ಷಮೆ ಕೇಳಬೇಕು! 📷",
        "🤯 ಬ್ರೋ, ಈ ಎಕ್ಸ್‌ಪ್ರೆಶನ್ ನೋಡಿದ್ರೆ ಕಥೆಯಲ್ಲಿ ದೊಡ್ಡ ಟ್ವಿಸ್ಟ್ ಇದೆ! 🎬",
        "😱 ಗುರು, ನಿನ್ನ ಮುಖವೇ ಇವತ್ತಿನ ಶಾಕಿಂಗ್ ನ್ಯೂಸ್! 📰"
    ],

    LAUGHING: [
        "😂 ಅಯ್ಯೋ ಬ್ರೋ, ನೀನೇ ನಿನ್ನ ಜೋಕ್‌ಗೆ ಲಾಫ್ ಮಾಡ್ತಿದ್ದೀಯಾ! 🤣",
        "🤣 ಗುರು, ಕಾಮಿಡಿ ಶೋ ಸ್ಟಾರ್ಟ್ ಮಾಡ್ಬಿಟ್ರಾ? 🎤",
        "😂 ಬ್ರೋ, ನಿನ್ನ ಲಾಫ್ ನೋಡಿದ್ರೆ ಏನೋ ಸಸ್ಪಿಷಿಯಸ್ ಆಗಿ ಫನ್ನಿ ಇದೆ! 🤨",
        "🤣 ಅಯ್ಯೋ ಗುರು, ಇಷ್ಟು ಜೋರಾಗಿ ಯಾಕೆ ನಗ್ತಿದ್ದೀಯಾ? 😂",
        "😆 ಬ್ರೋ, ಜೋಕ್ ಯಾರು ಹೇಳಿದರು? ನೀನಾ ಅಥವಾ ಕ್ಯಾಮೆರಾನಾ? 📷",
        "😂 ಗುರು, ನಿನ್ನ ನಗು ನೋಡಿದ್ರೆ ನಮಗೂ ನಗಬೇಕು ಅನ್ಸುತ್ತೆ! 😄",
        "🤣 ಬ್ರೋ, ಈ ಲಾಫ್‌ಗೆ ಕಾರಣ ಹೇಳು, ನಾವೂ ನಗೋಣ! 😆",
        "😂 ಅಯ್ಯೋ ಗುರು, ನಗು ನಿಲ್ಲಿಸೋಕೆ ಬ್ರೇಕ್ ಬೇಕಾ? 🛑",
        "😆 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್ ಈಗ ಫುಲ್ ಕಾಮಿಡಿ ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! 🎭",
        "🤣 ಗುರು, ಏನೋ ತುಂಬಾ ಫನ್ನಿ ನೆನಪಿಗೆ ಬಂದಿರಬೇಕು! 💭",
        "😂 ಬ್ರೋ, ನಿನ್ನ ನಗುವಿಗೆ ವೈಫೈಗಿಂತಲೂ ಫುಲ್ ಸಿಗ್ನಲ್ ಇದೆ! 📶",
        "😄 ಅಯ್ಯೋ, ಈ ನಗು ನೋಡಿದ್ರೆ ದುಃಖಕ್ಕೂ ರಜೆ ಕೊಡಬೇಕು! ❤️",
        "🤣 ಗುರು, ನೀನು ನಗ್ತಿದ್ದೀಯಾ ಅಥವಾ ಕ್ಯಾಮೆರಾನೇ ನಿನ್ನನ್ನ ನಗಿಸ್ತಿದೆಯಾ? 📷",
        "😂 ಬ್ರೋ, ನಿನ್ನ ಲಾಫ್ ನೋಡಿದ್ರೆ ಮೀಮ್ ಮಾಡಬೇಕು ಅನ್ಸುತ್ತೆ! 📱",
        "😆 ಗುರು, ಇವತ್ತು ಕಾಮಿಡಿ ಕಿಂಗ್ ನೀನೇ! 👑",
        "🤣 ಅಯ್ಯೋ ಬ್ರೋ, ಈ ನಗು ಎಲ್ಲಿ ಕಲಿತೆ? 😂",
        "😄 ಬ್ರೋ, ನಿನ್ನ ಮುಖ ಹೇಳ್ತಿದೆ — 'ಲೈಫ್ ತುಂಬಾ ಫನ್ನಿ!' 🎉",
        "😂 ಗುರು, ನಿನ್ನ ನಗುವಿಗೆ ಸೌಂಡ್ ಎಫೆಕ್ಟ್ ಕೂಡ ಬೇಕು! 🔊",
        "🤣 ಬ್ರೋ, ಇಷ್ಟು ನಗ್ತಿದ್ದೀಯಾ ಅಂದ್ರೆ ಏನೋ ದೊಡ್ಡ ಕಾಮಿಡಿ ನಡೆದಿದೆ! 🎭",
        "😂 ಅಯ್ಯೋ ಗುರು, ನಗು ಮುಂದುವರಿಸು... ಕ್ಯಾಮೆರಾ ಎಂಜಾಯ್ ಮಾಡ್ತಿದೆ! 📷"
    ],

    SLEEPY: [
        "😴 ಬ್ರೋ, ಬಾಡಿ ಇಲ್ಲಿದೆ, ಬಟ್ ಮೈಂಡ್ ಆಲ್ರೆಡಿ ಸ್ಲೀಪ್ ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! 💤",
        "🥱 ಗುರು, ಕಾಫಿ ಬೇಕಾ? ಫೇಸ್ ಫುಲ್ ಸ್ಲೀಪೀ ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! ☕",
        "😴 ಬ್ರೋ, ಇನ್ನೂ ಫೈವ್ ಮಿನಿಟ್ಸ್ ಅಂದ್ರೆ ಡೈರೆಕ್ಟ್ ಡ್ರೀಮ್ ವರ್ಲ್ಡ್‌ಗೆ ಹೋಗ್ತೀರಾ! 💤",
        "🥱 ಅಯ್ಯೋ ಗುರು, ಕಣ್ಣುಗಳು ರಜೆ ತೆಗೆದುಕೊಂಡಿವೆ ಅನ್ಸುತ್ತೆ! 😴",
        "😴 ಬ್ರೋ, ನೀನು ಕ್ಯಾಮೆರಾ ನೋಡ್ತಿದ್ದೀಯಾ ಅಥವಾ ಕನಸು ಕಾಣ್ತಿದ್ದೀಯಾ? 💭",
        "🛏️ ಗುರು, ಈ ಫೇಸ್‌ಗೆ ಒಂದು ಪಿಲ್ಲೋ ಬೇಕು! 😴",
        "😪 ಬ್ರೋ, ಸ್ಲೀಪ್ ಮೋಡ್ ಆನ್ ಆಗಿದೆ, ಚಾರ್ಜರ್ ಎಲ್ಲಿ? 🔋",
        "🥱 ಅಯ್ಯೋ, ಕಣ್ಣುಗಳು ಹೇಳ್ತಿವೆ — 'ನಮಗೆ ಮನೆಗೆ ಹೋಗಬೇಕು!' 🏠",
        "😴 ಗುರು, ಇವತ್ತು ನಿದ್ರೆ ಜಾಸ್ತಿ ಆಯ್ತಾ ಅಥವಾ ಕಡಿಮೆ ಆಯ್ತಾ? ⏰",
        "🥱 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್ ನೋಡಿದ್ರೆ ಅಲಾರಂ ಕೂಡ ಸೋತು ಹೋಗುತ್ತೆ! ⏰",
        "☕ ಅಯ್ಯೋ ಗುರು, ಕಾಫಿ ಇಲ್ಲದೆ ಈ ಮಿಷನ್ ಕಷ್ಟ ಅನ್ಸುತ್ತೆ! 😴",
        "😴 ಬ್ರೋ, ನಿನ್ನ ಮೈಂಡ್ ಈಗಾಗಲೇ ಡ್ರೀಮ್ ವರ್ಲ್ಡ್‌ನಲ್ಲಿ ಚೆಕ್-ಇನ್ ಆಗಿದೆ! 🌙",
        "🥱 ಗುರು, ಕಣ್ಣು ಮುಚ್ಚಿದ್ರೆ ರೋಸ್ಟ್ ಬದಲು ಡ್ರೀಮ್ ಶುರು ಆಗುತ್ತೆ! 💭",
        "😴 ಬ್ರೋ, ಈ ಎಕ್ಸ್‌ಪ್ರೆಶನ್‌ಗೆ 'ಗುಡ್ ನೈಟ್' ಹೇಳಬೇಕು ಅನ್ಸುತ್ತೆ! 🌙",
        "🥱 ಅಯ್ಯೋ ಗುರು, ನೀನು ಎಚ್ಚರದಲ್ಲಿದ್ದೀಯಾ ಅನ್ನೋದೇ ಡೌಟ್! 🤔",
        "😴 ಬ್ರೋ, ನಿನ್ನ ಮುಖ ಈಗ ಸೋಮವಾರ ಬೆಳಗಿನ ವೈಬ್ ಕೊಡ್ತಿದೆ! ☕",
        "🥱 ಗುರು, ಇನ್ನೊಂದು ನಿಮಿಷ ಅಂದ್ರೆ ಇಲ್ಲೇ ಮಲಗ್ತೀಯಾ! 🛏️",
        "😴 ಬ್ರೋ, ನಿದ್ರೆ ನಿನ್ನ ಮೇಲೆ ಫುಲ್ ಕಂಟ್ರೋಲ್ ತೆಗೆದುಕೊಂಡಿದೆ! 💤",
        "☕ ಅಯ್ಯೋ ಗುರು, ಕಾಫಿ ಕಳುಹಿಸೋಣವಾ ಅಥವಾ ಕಂಬಳಿ ಕಳುಹಿಸೋಣವಾ? 🛌",
        "😴 ಬ್ರೋ, ನಿನ್ನ ಕಣ್ಣುಗಳು ಈಗ 'ಗುಡ್ ನೈಟ್ ಬ್ರೋ' ಅಂತ ಹೇಳ್ತಿವೆ! 🌙"
    ],

    BORED: [
        "🥱 ಅಯ್ಯೋ ಬ್ರೋ, ಎಂಟರ್‌ಟೈನ್‌ಮೆಂಟ್ ಲೆವೆಲ್ ಜೀರೋ ಆಗಿದೆ ಅನ್ಸುತ್ತೆ! 📉",
        "😐 ಗುರು, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ ಲೈಫ್ ಲೋಡಿಂಗ್ ಸ್ಕ್ರೀನ್ ಅಲ್ಲಿ ಸ್ಟಕ್ ಆಗಿದೆ! ⏳",
        "🥱 ಬ್ರೋ, ಏನೂ ಇಂಟರೆಸ್ಟಿಂಗ್ ಇಲ್ಲ ಅಂತ ಫೇಸ್‌ನೇ ಹೇಳ್ತಾ ಇದೆ! 😑",
        "😐 ಗುರು, ನಿನ್ನ ಮುಖಕ್ಕೆ ಬೋರ್ ಆಗಿದೆ ಅಂತ ಬೇರೆ ಹೇಳೋ ಅವಶ್ಯಕತೆ ಇಲ್ಲ! 🥱",
        "📶 ಬ್ರೋ, ವೈಫೈಗಿಂತ ನಿನ್ನ ಎನರ್ಜಿ ಸಿಗ್ನಲ್ ಕಡಿಮೆ ಇದೆ! 😴",
        "😑 ಅಯ್ಯೋ ಗುರು, ಏನಾದ್ರೂ ಫನ್ನಿ ಮಾಡೋಣವಾ? 🎭",
        "🥱 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್ ನೋಡಿದ್ರೆ ಟೈಮ್ ಕೂಡ ಸ್ಲೋ ಆಗಿದೆ ಅನ್ಸುತ್ತೆ! ⏰",
        "😐 ಗುರು, ಈ ಎಕ್ಸ್‌ಪ್ರೆಶನ್‌ಗೆ 'ಬೋರ್‌ಡಮ್ ಕಿಂಗ್' ಅವಾರ್ಡ್ ಕೊಡಬೇಕು! 👑",
        "🥱 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್‌ನೇ 'ಏನಾದ್ರೂ ಮಾಡಿ' ಅಂತ ಕೇಳ್ತಿದೆ! 🙄",
        "😑 ಅಯ್ಯೋ, ಎಂಟರ್‌ಟೈನ್‌ಮೆಂಟ್ ಹುಡುಕೋಕೆ ಗೂಗಲ್ ಬೇಕಾ? 🔍",
        "😐 ಗುರು, ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಇದ್ದರೂ ಫುಲ್ ಬೋರ್ ಆಗಿದ್ದೀಯಾ! 📷",
        "🔋 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್‌ನಲ್ಲಿ ಬ್ಯಾಟರಿ 1% ಮಾತ್ರ ಉಳಿದಿದೆ ಅನ್ಸುತ್ತೆ! 😩",
        "🥱 ಅಯ್ಯೋ ಗುರು, ಒಂದು ಮೀಮ್ ನೋಡೋಣವಾ? 😂",
        "😐 ಬ್ರೋ, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ ಸೋಮವಾರವೂ ನಾಚಿಕೊಳ್ಳಬೇಕು! 📅",
        "🥱 ಗುರು, ನಿನ್ನ ಬೋರ್ ಫೇಸ್ ನೋಡಿ ಗಡಿಯಾರಕ್ಕೂ ಬೋರ್ ಆಗುತ್ತೆ! ⏰",
        "😑 ಬ್ರೋ, ಜೀವನಕ್ಕೆ ರಿಫ್ರೆಶ್ ಬಟನ್ ಬೇಕಾ? 🔄",
        "🥱 ಅಯ್ಯೋ ಗುರು, ಈ ಫೇಸ್‌ಗೆ ಸ್ವಲ್ಪ ಎಂಟರ್‌ಟೈನ್‌ಮೆಂಟ್ ಇಂಜೆಕ್ಷನ್ ಬೇಕು! 💉",
        "😐 ಬ್ರೋ, ಏನೂ ಆಗ್ತಿಲ್ಲ ಅನ್ನೋದು ನಿನ್ನ ಮುಖದಲ್ಲೇ ಕ್ಲಿಯರ್ ಆಗಿದೆ! 👀",
        "🥱 ಗುರು, ನಿನ್ನ ಫೇಸ್ ಈಗ 'ಸ್ಕಿಪ್ ಅಡ್' ಬಟನ್ ಹುಡುಕ್ತಿದೆ! ⏭️"
    ],

    SUSPICIOUS: [
        "🤨 ಹ್ಮ್ಮ್ ಬ್ರೋ... ಏನೋ ಸೀಕ್ರೆಟ್ ಪ್ಲಾನ್ ಇದೆ ಅನ್ಸುತ್ತೆ! 🕵️",
        "🧐 ಗುರು, ಈ ಐಬ್ರೋ ನೋಡಿದ್ರೆ ಇನ್ವೆಸ್ಟಿಗೇಷನ್ ಸ್ಟಾರ್ಟ್ ಆಗಿದೆ! 🔍",
        "🤨 ಬ್ರೋ, ನಿನಗೆ ಏನೋ ಗೊತ್ತಿದೆ, ಬಟ್ ಹೇಳಲ್ಲ ಅನ್ಸುತ್ತೆ! 🤫",
        "🧐 ಅಯ್ಯೋ ಗುರು, ಈ ಲುಕ್ ತುಂಬಾ ಸಸ್ಪಿಷಿಯಸ್ ಆಗಿದೆ! 👀",
        "🤨 ಬ್ರೋ, ಏನೋ ಸೀಕ್ರೆಟ್ ಮಿಷನ್‌ನಲ್ಲಿ ಇದ್ದೀಯಾ? 🕵️",
        "🧐 ಗುರು, ನಿನ್ನ ಐಬ್ರೋಗಳು ಈಗ ಪೊಲೀಸ್ ಆಫೀಸರ್ ಆಗಿವೆ! 👮",
        "🤨 ಬ್ರೋ, ಯಾರನ್ನೋ ಡೌಟ್ ಮಾಡ್ತಿದ್ದೀಯಾ ಅನ್ಸುತ್ತೆ! 👀",
        "🧐 ಅಯ್ಯೋ ಗುರು, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ 'ನಾನು ಎಲ್ಲವನ್ನೂ ನೋಡ್ತಿದ್ದೀನಿ' ಅಂತ ಇದೆ! 👁️",
        "🤨 ಬ್ರೋ, ನಿನ್ನ ಕಣ್ಣುಗಳು ಏನೋ ಸೀಕ್ರೆಟ್ ಹುಡುಕ್ತಿವೆ! 🔎",
        "🕵️ ಗುರು, ಏನೋ ಪ್ಲಾನ್ ಮಾಡ್ತಿದ್ದೀಯಾ... ನಮಗೆ ಹೇಳೋದಿಲ್ಲ ಅಲ್ವಾ? 🤫",
        "🤨 ಬ್ರೋ, ಈ ಎಕ್ಸ್‌ಪ್ರೆಶನ್‌ಗೆ ಡಿಟೆಕ್ಟಿವ್ ಟೋಪಿ ಬೇಕು! 🎩",
        "🧐 ಅಯ್ಯೋ, ನಿನ್ನ ಫೇಸ್ ಈಗ ಇನ್ವೆಸ್ಟಿಗೇಷನ್ ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! 🔍",
        "🤨 ಗುರು, ಯಾರಾದ್ರೂ ಸುಳ್ಳು ಹೇಳಿದ್ರಾ? 🤥",
        "🧐 ಬ್ರೋ, ನಿನ್ನ ಲುಕ್ ಹೇಳ್ತಿದೆ — 'ನಾನು ನಿನ್ನನ್ನ ನಂಬಲ್ಲ!' 🚫",
        "🤨 ಅಯ್ಯೋ ಗುರು, ಈ ಸಸ್ಪಿಷಿಯಸ್ ಲುಕ್ ತುಂಬಾ ಪವರ್‌ಫುಲ್ ಇದೆ! ⚡",
        "🕵️ ಬ್ರೋ, ಏನೋ ಸೀಕ್ರೆಟ್ ಕೋಡ್ ಡಿಕೋಡ್ ಮಾಡ್ತಿದ್ದೀಯಾ? 💻",
        "🤨 ಗುರು, ನಿನ್ನ ಐಬ್ರೋ ನೋಡಿದ್ರೆ ಪ್ರಶ್ನೆಗಳು ಶುರು ಆಗಿವೆ! ❓",
        "🧐 ಬ್ರೋ, ಕ್ಯಾಮೆರಾ ಮೇಲೂ ಡೌಟ್ ಮಾಡ್ತಿದ್ದೀಯಾ? 📷",
        "🤨 ಅಯ್ಯೋ ಗುರು, ನಿನ್ನ ಫೇಸ್ ಈಗ ಫುಲ್ ಡಿಟೆಕ್ಟಿವ್ ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! 🕵️",
        "🧐 ಬ್ರೋ, ಸೀಕ್ರೆಟ್ ಗೊತ್ತಿದ್ರೆ ನಮಗೂ ಹೇಳು ಗುರು! 🤫"
    ],

    SHY: [
        "😳 ಅಯ್ಯೋ ಬ್ರೋ, ಕ್ಯಾಮೆರಾ ನೋಡಿ ಫುಲ್ ಶೈ ಆಗ್ಬಿಟ್ರಾ! 🙈",
        "😊 ಗುರು, ಸಡನ್ ಆಗಿ ಇಂಟ್ರೊವರ್ಟ್ ಮೋಡ್ ಆನ್ ಆಯ್ತಾ? 🤭",
        "🙈 ಬ್ರೋ, ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಬಂದ್ಮೇಲೆ ಸ್ಟೆಲ್ತ್ ಮೋಡ್‌ಗೆ ಹೋಗ್ಬಿಟ್ರಾ! 🫣",
        "😳 ಅಯ್ಯೋ ಗುರು, ಇಷ್ಟು ನಾಚಿಕೆ ಯಾಕೆ? 😊",
        "🙈 ಬ್ರೋ, ಕ್ಯಾಮೆರಾ ನಿನ್ನ ಕ್ರಷ್ ಅಲ್ಲ ಗುರು! 😂",
        "😊 ಗುರು, ಮುಖ ನೋಡಿದ್ರೆ ಯಾರೋ ಕಾಂಪ್ಲಿಮೆಂಟ್ ಮಾಡಿದಂಗೆ ಇದೆ! 💕",
        "🥰 ಬ್ರೋ, ಈ ಶೈ ಲುಕ್ ತುಂಬಾ ಕ್ಯೂಟ್ ಆಗಿದೆ! 😳",
        "😳 ಅಯ್ಯೋ, ಕ್ಯಾಮೆರಾ ನೋಡಿದ ತಕ್ಷಣ ಕೆನ್ನೆ ಕೆಂಪಾಗಿದೆ! 😊",
        "🤭 ಗುರು, ಏನೋ ಸೀಕ್ರೆಟ್ ಕ್ರಷ್ ನೆನಪಾಯ್ತಾ? 💕",
        "😳 ಬ್ರೋ, ನಾಚಿಕೆ ಮೋಡ್ ಫುಲ್ ಸ್ಪೀಡ್‌ನಲ್ಲಿ ಓಡ್ತಿದೆ! 🏃",
        "🙈 ಅಯ್ಯೋ ಗುರು, ಕ್ಯಾಮೆರಾ ಜೊತೆ ಕಣ್ಣಲ್ಲಿ ಕಣ್ಣು ಹಾಕೋಕೆ ಆಗ್ತಿಲ್ಲವಾ? 👀",
        "🤭 ಬ್ರೋ, ಈ ಫೇಸ್ ನೋಡಿದ್ರೆ 'ನನ್ನನ್ನ ನೋಡ್ಬೇಡಿ' ಅಂತ ಹೇಳ್ತಿದೆ! 🙈",
        "😊 ಗುರು, ಇವತ್ತು ಶೈನೆಸ್ ಲೆವೆಲ್ 100% ಇದೆ! 💯",
        "🥰 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್ ಈಗ ಫುಲ್ ಬ್ಲಷ್ ಮೋಡ್‌ನಲ್ಲಿ ಇದೆ! 🌸",
        "😳 ಅಯ್ಯೋ, ಇಷ್ಟು ನಾಚಿಕೆ ನೋಡಿದ್ರೆ ಕ್ಯಾಮೆರಾನೇ ಸಾರಿ ಕೇಳಬೇಕು! 📷",
        "🤭 ಗುರು, ಯಾರಾದ್ರೂ ನಿನ್ನನ್ನ ಹೊಗಳಿದ್ರಾ? 💬",
        "🥰 ಬ್ರೋ, ಈ ಶೈ ಲುಕ್‌ಗೆ ಒಂದು ಹಾರ್ಟ್ ಎಮೋಜಿ ಬೇಕು! ❤️",
        "🙈 ಅಯ್ಯೋ ಗುರು, ಕಣ್ಣು ಕೆಳಗೆ ಹಾಕಿ ಏನೋ ಸೀಕ್ರೆಟ್ ಮಾಡ್ತಿದ್ದೀಯಾ! 🤫",
        "😳 ಬ್ರೋ, ಕ್ಯಾಮೆರಾ ಬಂದ ತಕ್ಷಣ ಶೈ ಮೋಡ್ ಆನ್ ಆಯ್ತು! 📷",
        "😊 ಗುರು, ನಿನ್ನ ನಾಚಿಕೆ ನೋಡಿದ್ರೆ ಇವತ್ತು ಏನೋ ಸ್ಪೆಷಲ್ ಇದೆ ಅನ್ಸುತ್ತೆ! ✨"
    ],

    SMIRK: [
        "😏 ಬ್ರೋ, ಈ ಸ್ಮಿರ್ಕ್ ನೋಡಿದ್ರೆ ಏನೋ ಪ್ಲಾನ್ ರೆಡಿ ಇದೆ! 🧠",
        "😎 ಗುರು, ಈ ಕಾನ್ಫಿಡೆನ್ಸ್ ಸ್ವಲ್ಪ ಸಸ್ಪಿಷಿಯಸ್ ಇದೆ! 🤨",
        "😏 ಬ್ರೋ, ಫೇಸ್ ನೋಡಿದ್ರೆ 'ನನಗೆ ಎಲ್ಲ ಗೊತ್ತು' ಅಂತ ಹೇಳ್ತಾ ಇದೆ! 🧠",
        "😉 ಅಯ್ಯೋ ಗುರು, ಈ ಸ್ಮೈಲ್ ಹಿಂದೆ ಏನೋ ಸೀಕ್ರೆಟ್ ಇದೆ! 🤫",
        "😏 ಬ್ರೋ, ನೀನು ಏನೋ ಗೆದ್ದಂಗೆ ಸ್ಮಿರ್ಕ್ ಮಾಡ್ತಿದ್ದೀಯಾ! 🏆",
        "😎 ಗುರು, ಈ ಲುಕ್ ನೋಡಿದ್ರೆ ಪ್ಲಾನ್ ಈಗಾಗಲೇ ರೆಡಿ ಅನ್ಸುತ್ತೆ! 📋",
        "😏 ಬ್ರೋ, ಏನೋ ಮಾಡಿದ್ದೀಯಾ... ಆದರೆ ಯಾರಿಗೂ ಹೇಳಲ್ಲ ಅಲ್ವಾ? 🤫",
        "😎 ಅಯ್ಯೋ ಗುರು, ಈ ಮುಖ ತುಂಬಾ ಕಾನ್ಫಿಡೆಂಟ್ ಆಗಿದೆ! 💪",
        "😏 ಬ್ರೋ, ನಿನ್ನ ಸ್ಮಿರ್ಕ್ ಹೇಳ್ತಿದೆ — 'ಗೇಮ್ ನನ್ನ ಕೈಯಲ್ಲಿದೆ!' 🎮",
        "😉 ಗುರು, ಏನೋ ಸೀಕ್ರೆಟ್ ಜೋಕ್ ಗೊತ್ತಿದೆ ನಿನಗೆ! 🤭",
        "😈 ಬ್ರೋ, ಈ ಎಕ್ಸ್‌ಪ್ರೆಶನ್ ಫುಲ್ ವಿಲನ್ ಎನರ್ಜಿ ಕೊಡ್ತಿದೆ! 🎬",
        "😏 ಅಯ್ಯೋ ಗುರು, ಈ ಸ್ಮಿರ್ಕ್ ಸ್ವಲ್ಪ ಡೇಂಜರಸ್ ಆಗಿದೆ! ⚠️",
        "😎 ಬ್ರೋ, ನಿನ್ನ ಮುಖ ನೋಡಿದ್ರೆ ನೀನು ಏನೋ ಪ್ಲಾನ್ ಮಾಡಿದ್ದೀಯಾ! 🧠",
        "🤨 ಗುರು, ಈ ಕಾನ್ಫಿಡೆನ್ಸ್‌ಗೆ ಕಾರಣ ಏನು? 👀",
        "😏 ಬ್ರೋ, ಯಾರನ್ನಾದ್ರೂ ಟ್ರೋಲ್ ಮಾಡೋಕೆ ರೆಡಿ ಆಗಿದ್ದೀಯಾ? 😂",
        "😈 ಅಯ್ಯೋ ಗುರು, ಈ ಸ್ಮಿರ್ಕ್ ಹಿಂದೆ ದೊಡ್ಡ ಕಥೆ ಇದೆ ಅನ್ಸುತ್ತೆ! 📖",
        "😏 ಬ್ರೋ, ನಿನ್ನ ಫೇಸ್ ಹೇಳ್ತಿದೆ — 'ನನಗೆ ಸೀಕ್ರೆಟ್ ಗೊತ್ತು!' 🤫",
        "😎 ಗುರು, ಈ ಲುಕ್ ನೋಡಿದ್ರೆ ನೀನೇ ಗೇಮ್ ಮಾಸ್ಟರ್ ಅನ್ಸುತ್ತೆ! 🎮",
        "😏 ಬ್ರೋ, ಈ ಸ್ಮಿರ್ಕ್ ಕ್ಯಾಮೆರಾಕ್ಕೂ ಡೌಟ್ ಬರೋ ಹಾಗೆ ಮಾಡಿದೆ! 📷"
    ]

};
/* ============================================================
   GET RANDOM ROAST
============================================================ */

function getRoast(expression) {

    const list =
        ROASTS[expression] ||
        ROASTS.SERIOUS;


    const roast =
        list[
            Math.floor(
                Math.random() *
                list.length
            )
        ];


    const emoji =
        EXPRESSION_EMOJIS[expression] ||
        "😂";


    return `${emoji} ${roast} ${emoji}`;

}


/* ============================================================
   KANNADA VOICE
============================================================ */
function speakRoast(text) {

    console.log("VOICE:", text);

    // Remove emojis and other symbols before speaking
    const cleanText = text
        .replace(
            /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
            ""
        )
        .replace(/\s+/g, " ")
        .trim();

    console.log("CLEAN VOICE:", cleanText);

    // Stop previous speech
    window.speechSynthesis.cancel();

    // Create speech using ONLY the Kannada text
    const speech =
        new SpeechSynthesisUtterance(cleanText);

    speech.lang = "kn-IN";
    speech.rate = 0.9;
    speech.pitch = 1.0;
    speech.volume = 1.0;

    window.speechSynthesis.speak(speech);
}
/* ============================================================
   CREATE FACE LANDMARKER
============================================================ */

async function createFaceLandmarker() {

    status.textContent =
        "🧠 Loading face AI...";


    const vision =
        await FilesetResolver.forVisionTasks(
            "/node_modules/@mediapipe/tasks-vision/wasm"
        );


    faceLandmarker =
        await FaceLandmarker.createFromOptions(
            vision,
            {

                baseOptions: {

                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"

                },

                runningMode: "VIDEO",

                numFaces: 1,

                minFaceDetectionConfidence: 0.5,

                minFacePresenceConfidence: 0.5,

                minTrackingConfidence: 0.5

            }
        );


    status.textContent =
        "✅ Face AI ready";

}


/* ============================================================
   START CAMERA
============================================================ */

async function startCamera() {

    try {

        status.classList.remove(
            "hidden"
        );


        countdown.classList.add(
            "hidden"
        );


        roastPanel.classList.add(
            "hidden"
        );


        roastPanel.classList.remove(
            "show"
        );


        status.textContent =
            "📷 Starting camera...";


        const stream =
            await navigator.mediaDevices.getUserMedia(
                {

                    video: {

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        },

                        facingMode: "user"

                    },

                    audio: false

                }
            );


        video.srcObject =
            stream;


        await video.play();


        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;


        await createFaceLandmarker();


        startScreen.classList.add(
            "hidden"
        );


        analysisStartTime =
            null;

        expressionHistory =
            [];

        lockedExpression =
            null;

        candidateExpression =
            null;

        candidateStartTime =
            null;


        status.textContent =
            "👀 Get ready...";


        running = true;


        requestAnimationFrame(
            processFrame
        );

    }

    catch (error) {

        console.error(
            "CAMERA / AI ERROR:",
            error
        );


        status.classList.remove(
            "hidden"
        );


        status.textContent =
            "❌ Camera or AI failed. Check the browser console.";

    }

}


/* ============================================================
   DETECT EXPRESSION
============================================================ */

function detectExpression(landmarks) {

    const upperLip =
        landmarks[13];

    const lowerLip =
        landmarks[14];

    const leftMouth =
        landmarks[61];

    const rightMouth =
        landmarks[291];


    const mouthHeight =
        Math.abs(
            lowerLip.y -
            upperLip.y
        );


    const mouthWidth =
        Math.abs(
            rightMouth.x -
            leftMouth.x
        );


    const mouthRatio =
        mouthHeight /
        Math.max(
            mouthWidth,
            0.001
        );


    const leftEyeTop =
        landmarks[159];

    const leftEyeBottom =
        landmarks[145];

    const rightEyeTop =
        landmarks[386];

    const rightEyeBottom =
        landmarks[374];


    const leftEyeOpen =
        Math.abs(
            leftEyeTop.y -
            leftEyeBottom.y
        );


    const rightEyeOpen =
        Math.abs(
            rightEyeTop.y -
            rightEyeBottom.y
        );


    const eyeOpen =
        (
            leftEyeOpen +
            rightEyeOpen
        ) / 2;


    const leftEyebrow =
        landmarks[105];

    const rightEyebrow =
        landmarks[334];

    const leftEyeCenter =
        landmarks[159];

    const rightEyeCenter =
        landmarks[386];


    const eyebrowDistance =
        (

            Math.abs(
                leftEyebrow.y -
                leftEyeCenter.y
            )

            +

            Math.abs(
                rightEyebrow.y -
                rightEyeCenter.y
            )

        ) / 2;


    if (mouthRatio > 0.45) {

        return "SHOCKED";

    }


    if (mouthRatio > 0.32) {

        return "SURPRISED";

    }


    if (
        mouthRatio > 0.22 &&
        mouthWidth > 0.16
    ) {

        return "HAPPY";

    }


    if (
        mouthRatio > 0.18 &&
        mouthWidth > 0.18
    ) {

        return "LAUGHING";

    }


    if (eyeOpen < 0.012) {

        return "SLEEPY";

    }


    if (eyebrowDistance < 0.025) {

        return "SUSPICIOUS";

    }


    if (mouthRatio > 0.14) {

        return "SHY";

    }


    if (mouthWidth > 0.14) {

        return "SMIRK";

    }


    if (eyeOpen < 0.018) {

        return "BORED";

    }


    return "SERIOUS";

}


/* ============================================================
   SHOW ROAST
============================================================ */

function lockExpression(expression) {

    lockedExpression =
        expression;


    const emoji =
        EXPRESSION_EMOJIS[expression] ||
        "😂";


    expressionText.textContent =
        `${emoji} Expression: ${expression}`;


    const roast =
        getRoast(expression);


    roastText.textContent =
        roast;


    roastPanel.classList.remove(
        "hidden"
    );


    requestAnimationFrame(() => {

        roastPanel.classList.add(
            "show"
        );

    });


    /* ========================================================
       GOOGLE VOICE
    ======================================================== */

    speakRoast(roast);

}


/* ============================================================
   HIDE ROAST
============================================================ */

function hideRoastPanel() {

    roastPanel.classList.remove(
        "show"
    );


    setTimeout(() => {

        if (
            !roastPanel.classList.contains(
                "show"
            )
        ) {

            roastPanel.classList.add(
                "hidden"
            );

        }

    }, 450);

}


/* ============================================================
   COUNTDOWN
============================================================ */

function updateCountdown(elapsed) {

    const remaining =
        Math.max(
            0,
            ANALYSIS_TIME -
            elapsed
        );


    const number =
        Math.max(
            1,
            Math.ceil(
                remaining / 1000
            )
        );


    countdownNumber.textContent =
        number;


    countdown.classList.remove(
        "hidden"
    );


    status.textContent =
        `🧠 AI analyzing... ${number}`;

}


/* ============================================================
   MAIN AI LOOP
============================================================ */

function processFrame(timestamp) {

    if (!running) {

        return;

    }


    if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        requestAnimationFrame(
            processFrame
        );

        return;

    }


    const result =
        faceLandmarker.detectForVideo(
            video,
            timestamp
        );


    if (
        result.faceLandmarks &&
        result.faceLandmarks.length > 0
    ) {

        const landmarks =
            result.faceLandmarks[0];


        const currentExpression =
            detectExpression(
                landmarks
            );


        /* ====================================================
           FIRST 5 SECONDS
        ==================================================== */

        if (!lockedExpression) {

            if (!analysisStartTime) {

                analysisStartTime =
                    performance.now();

                expressionHistory =
                    [];

            }


            expressionHistory.push(
                currentExpression
            );


            const elapsed =
                performance.now() -
                analysisStartTime;


            if (
                elapsed <
                ANALYSIS_TIME
            ) {

                updateCountdown(
                    elapsed
                );

            }


            if (
                elapsed >=
                ANALYSIS_TIME
            ) {

                countdown.classList.add(
                    "hidden"
                );


                status.textContent =
                    "🔥 ROAST!";


                const counts = {};


                for (
                    const expression
                    of expressionHistory
                ) {

                    counts[expression] =
                        (
                            counts[expression] ||
                            0
                        ) + 1;

                }


                let mostCommon =
                    "SERIOUS";


                let highestCount =
                    0;


                for (
                    const expression
                    in counts
                ) {

                    if (
                        counts[expression] >
                        highestCount
                    ) {

                        highestCount =
                            counts[expression];

                        mostCommon =
                            expression;

                    }

                }


                lockExpression(
                    mostCommon
                );

            }

        }


        /* ====================================================
           AFTER ROAST
        ==================================================== */

        else {

            if (
                currentExpression !==
                lockedExpression
            ) {

                if (
                    candidateExpression !==
                    currentExpression
                ) {

                    candidateExpression =
                        currentExpression;

                    candidateStartTime =
                        performance.now();

                }

                else {

                    const duration =
                        performance.now() -
                        candidateStartTime;


                    if (
                        duration >=
                        EXPRESSION_CHANGE_TIME
                    ) {

                        lockExpression(
                            currentExpression
                        );


                        candidateExpression =
                            null;

                        candidateStartTime =
                            null;


                        status.textContent =
                            "🔄 New expression detected!";

                    }

                }

            }

            else {

                candidateExpression =
                    null;

                candidateStartTime =
                    null;

            }

        }

    }

    else {

        analysisStartTime =
            null;


        expressionHistory =
            [];


        candidateExpression =
            null;


        candidateStartTime =
            null;


        lockedExpression =
            null;


        countdown.classList.add(
            "hidden"
        );


        hideRoastPanel();


        status.textContent =
            "👀 Step in front of the camera";

    }


    requestAnimationFrame(
        processFrame
    );

}


/* ============================================================
   START BUTTON
============================================================ */

startButton.addEventListener(
    "click",
    startCamera
);