// main.js

let rawQuestions = [];  // 从 Google Sheets 解析的原始数据
let questions = [];     // 当前组别的题目
let currentQuestionIndex = 0;
let selectedGroup = 1;  // 默认选择第 1 组

// **Google Sheets CSV 访问链接**
const sheetURL = "https://docs.google.com/spreadsheets/d/1pgTIuGFEYBWVVW8MARVXBZiI0Eb7TghJakZOuK1P1HA/gviz/tq?tqx=out:csv";

// **从 Google Sheets 获取数据**
fetch(sheetURL)
  .then(response => response.text())
  .then(csvText => {
    rawQuestions = parseCSV(csvText);
    updateQuestionSet();
    showQuestion();
  })
  .catch(error => console.error('Error loading quiz data:', error));

// **解析 CSV 数据**
function parseCSV(csvText) {
    const rows = csvText.split("\n").map(row => row.split(","));
    return rows.slice(1).map(row => ({
        finnish: row[0].replace(/"/g, '').trim(),
        english: row[1].replace(/"/g, '').trim(),
        group: parseInt(row[2].replace(/"/g, '').trim(), 10)
    }));
}

// **根据选定的组别更新题库**
function updateQuestionSet() {
    let filteredQuestions = rawQuestions.filter(q => q.group === selectedGroup);

    questions = filteredQuestions.map(q => {
        let options = generateOptions(q.finnish, filteredQuestions);
        return {
            question: q.english,   // 题目显示英语单词
            options: options,      // 选项显示芬兰语单词
            answer: q.finnish,     // 正确答案
            ttsText: q.finnish     // 朗读芬兰语单词
        };
    });

    // **随机化题目顺序**
    questions = shuffleArray(questions);
}

// **从当前组别生成干扰项**
function generateOptions(correctAnswer, groupQuestions) {
    let distractorPool = groupQuestions.map(q => q.finnish).filter(ans => ans !== correctAnswer);
    let shuffledDistractors = shuffleArray(distractorPool).slice(0, 3);
    let options = [correctAnswer, ...shuffledDistractors];
    return shuffleArray(options);
}

// **Fisher-Yates 洗牌算法**
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// **显示当前题目**
function showQuestion() {
    const container = document.getElementById('question-container');
    container.innerHTML = '';

    if (questions.length === 0) return;

    const questionObj = questions[currentQuestionIndex];

    // **显示英语题目**
    const questionElem = document.createElement('h2');
    questionElem.textContent = questionObj.question;
    container.appendChild(questionElem);

    // **创建芬兰语选项按钮**
    questionObj.options.forEach(finnishWord => {
        const btn = document.createElement('button');
        btn.textContent = finnishWord;
        btn.onclick = () => checkAnswer(finnishWord, questionObj.answer, questionObj.ttsText);
        container.appendChild(btn);
    });
}

// **检查答案**
function checkAnswer(selectedFinnish, correctFinnish, ttsText) {
    if (selectedFinnish === correctFinnish) {
        alert('Correct!');
    } else {
        alert(`Incorrect. The correct answer is: ${correctFinnish}`);
    }
    speak(ttsText);
}

// **语音朗读**
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fi-FI';

    const setFinnishVoice = () => {
        const voices = speechSynthesis.getVoices();
        const finnishVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('fi'));
        if (finnishVoice) {
            utterance.voice = finnishVoice;
        }
        speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', setFinnishVoice);
    } else {
        setFinnishVoice();
    }
}

// **下一题**
document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    showQuestion();
});

// **切换组别**
document.getElementById('group-selector').addEventListener('change', (event) => {
    selectedGroup = parseInt(event.target.value, 10);
    updateQuestionSet();
    showQuestion();
});
