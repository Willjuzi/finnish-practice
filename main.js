// main.js

let rawQuestions = [];
let questions = [];
let currentQuestionIndex = 0;
let selectedGroup = 1;
let completedGroups = new Set();

// **Google Sheets CSV 访问链接**
const sheetURL = "https://docs.google.com/spreadsheets/d/1pgTIuGFEYBWVVW8MARVXBZiI0Eb7TghJakZOuK1P1HA/gviz/tq?tqx=out:csv";

// **从 Google Sheets 获取数据**
fetch(sheetURL)
  .then(response => response.text())
  .then(csvText => {
    rawQuestions = parseCSV(csvText);
    updateGroupSelector();
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

// **更新组别选择框**
function updateGroupSelector() {
    const groupSelector = document.getElementById("group-selector");
    groupSelector.innerHTML = "";

    let uniqueGroups = [...new Set(rawQuestions.map(q => q.group))];
    uniqueGroups.sort((a, b) => a - b);

    uniqueGroups.forEach(groupNum => {
        let option = document.createElement("option");
        option.value = groupNum;
        option.textContent = `Group ${groupNum}`;
        groupSelector.appendChild(option);
    });

    groupSelector.addEventListener("change", (event) => {
        selectedGroup = parseInt(event.target.value, 10);
        updateQuestionSet();
        showQuestion();
    });

    if (uniqueGroups.length > 0) {
        selectedGroup = uniqueGroups[0];
        updateQuestionSet();
    }
}

// **更新当前题库**
function updateQuestionSet() {
    let filteredQuestions = rawQuestions.filter(q => q.group === selectedGroup);
    filteredQuestions = shuffleArray(filteredQuestions);

    questions = filteredQuestions.map(q => {
        let options = generateOptions(q.finnish, filteredQuestions);
        return {
            question: q.english,
            options: options,
            answer: q.finnish,
            ttsText: q.finnish
        };
    });

    questions = shuffleArray(questions);
    currentQuestionIndex = 0;
}

// **生成选项（只从当前组别选择干扰项）**
function generateOptions(correctAnswer, groupQuestions) {
    let distractorPool = groupQuestions.map(q => q.finnish).filter(ans => ans !== correctAnswer);
    let shuffledDistractors = shuffleArray(distractorPool).slice(0, 3);
    let options = [correctAnswer, ...shuffledDistractors];
    return shuffleArray(options);
}

// **随机化数组**
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// **显示题目**
function showQuestion() {
    const container = document.getElementById('question-container');
    container.innerHTML = '';

    if (currentQuestionIndex >= questions.length) {
        completedGroups.add(selectedGroup);
        alert(`🎉 Practice complete! You have finished all questions in this group!`);
        return;
    }

    const questionObj = questions[currentQuestionIndex];

    const questionElem = document.createElement('h2');
    questionElem.className = "question-text";
    questionElem.textContent = questionObj.question;
    container.appendChild(questionElem);

    questionObj.options.forEach(finnishWord => {
        const btn = document.createElement('button');
        btn.textContent = finnishWord;
        btn.className = "option-btn";
        btn.onclick = () => checkAnswer(finnishWord, questionObj.answer, questionObj.ttsText);
        container.appendChild(btn);
    });
}

// **检查答案**
function checkAnswer(selected, correct, ttsText) {
    if (selected === correct) {
        alert("🎉 Congratulations! You got it right! Keep going! 🚀");
    } else {
        alert(`❌ Oops! Try again! The correct answer is: ${correct} 😉`);
    }
    speak(ttsText);
}

// **语音朗读（使用 Google Translate API 进行芬兰语发音）**
function speak(text) {
    let audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=fi&client=tw-ob&q=${encodeURIComponent(text)}`);
    audio.oncanplaythrough = () => {
        audio.play().catch(error => console.error("Audio play failed:", error));
    };
    audio.onerror = () => {
        console.error("Error loading the TTS audio.");
    };
}

// **下一题**
document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});
