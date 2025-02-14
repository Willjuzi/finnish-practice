// main.js

let rawQuestions = [];
let questions = [];
let currentQuestionIndex = 0;
let selectedGroup = "";
let completedGroups = new Set();

// **从本地 questions.json 读取数据**
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    rawQuestions = data;
    console.log("Example question:", data[0]); // 检查第一条数据
    console.log("Available groups:", [...new Set(data.map(q => q.group))]); // 输出所有 group
    updateGroupSelector();
    updateQuestionSet();
    showQuestion();
  })
  .catch(error => console.error('Error loading quiz data:', error));

// **更新组别选择框**
function updateGroupSelector() {
    const groupSelector = document.getElementById("group-selector");
    groupSelector.innerHTML = "";

    let uniqueGroups = [...new Set(rawQuestions.map(q => q.group.trim()))]; // 确保去掉空格
    uniqueGroups.sort(); // 按字母顺序排列

    uniqueGroups.forEach(groupName => {
        let option = document.createElement("option");
        option.value = groupName;
        option.textContent = groupName;
        groupSelector.appendChild(option);
    });

    groupSelector.addEventListener("change", (event) => {
        selectedGroup = event.target.value;
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
    let filteredQuestions = rawQuestions.filter(q => q.group.trim().toLowerCase() === selectedGroup.trim().toLowerCase());

    if (filteredQuestions.length === 0) {
        alert(`⚠️ No questions available in "${selectedGroup}".`);
        return;
    }

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

// **语音朗读（优先使用 Web Speech API，如果不支持芬兰语，则回退到 Google Translate API）**
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fi-FI';

    let voices = speechSynthesis.getVoices();
    let finnishVoice = voices.find(voice => voice.lang.toLowerCase().includes('fi'));

    if (finnishVoice) {
        utterance.voice = finnishVoice;
        speechSynthesis.speak(utterance);
    } else {
        console.warn("No Finnish voice found. Using Google Translate TTS.");
        let audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=fi&client=tw-ob&q=${encodeURIComponent(text)}`);
        audio.oncanplaythrough = () => {
            audio.play().catch(error => console.error("Audio play failed:", error));
        };
        audio.onerror = () => {
            console.error("Error loading the TTS audio.");
        };
    }
}

// **下一题**
document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});
