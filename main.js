// main.js

// 预定义的干扰项词库，可以根据需要扩充
const distractorPool = [
  { finnish: "hevonen", english: "horse" },
  { finnish: "lammas",  english: "sheep" },
  { finnish: "lehmä",   english: "cow" },
  { finnish: "kana",    english: "chicken" },
  { finnish: "sika",    english: "pig" }
];

let rawQuestions = [];   // 存储从 JSON 文件中加载的原始数据
let questions = [];      // 生成后的完整题目数据
let currentQuestionIndex = 0;

// 从 questions.json 文件加载数据
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    rawQuestions = data;
    // 根据录入的数据生成完整题目
    questions = rawQuestions.map(q => {
      // 筛选出干扰项（排除当前正确答案对应的英语单词）
      const availableDistractors = distractorPool.filter(d => d.english !== q.english);
      
      // 随机选取三个干扰项并提取芬兰语
      const chosenDistractors = availableDistractors
                                  .sort(() => Math.random() - 0.5)
                                  .slice(0, 3)
                                  .map(d => d.finnish);

      // 组合选项并随机排序
      let options = [q.finnish, ...chosenDistractors];
      options = options.sort(() => Math.random() - 0.5);

      return {
        question: q.english,    // 题目显示英语单词
        options: options,       // 选项显示芬兰语单词
        answer: q.finnish,      // 正确答案的芬兰语
        ttsText: q.finnish      // 朗读芬兰语单词
      };
    });
    showQuestion();
  })
  .catch(error => console.error('Error loading quiz data:', error));

// 显示当前题目
function showQuestion() {
  const container = document.getElementById('question-container');
  container.innerHTML = '';

  if (questions.length === 0) return;

  const questionObj = questions[currentQuestionIndex];

  // 显示英语题目
  const questionElem = document.createElement('h2');
  questionElem.textContent = questionObj.question;
  container.appendChild(questionElem);

  // 创建芬兰语选项按钮
  questionObj.options.forEach(finnishWord => {
    const btn = document.createElement('button');
    btn.textContent = finnishWord;
    btn.onclick = () => checkAnswer(finnishWord, questionObj.answer, questionObj.ttsText);
    container.appendChild(btn);
  });
}

// 检查答案并反馈
function checkAnswer(selectedFinnish, correctFinnish, ttsText) {
  if (selectedFinnish === correctFinnish) {
    alert('Correct!');
  } else {
    alert(`Incorrect. The correct answer is: ${correctFinnish}`);
  }
  speak(ttsText);
}

// 语音朗读函数（保持原有优化）
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

// “Next Question” 按钮
document.getElementById('next-btn').addEventListener('click', () => {
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
  showQuestion();
});
