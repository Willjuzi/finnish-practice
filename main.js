// main.js

// 预定义的干扰项词库：可以扩充更多数据
const distractorPool = [
  { finnish: "hevonen", english: "horse" },
  { finnish: "lammas", english: "sheep" },
  { finnish: "lehmä", english: "cow" },
  { finnish: "kana", english: "chicken" },
  { finnish: "sika", english: "pig" }
];

let rawQuestions = [];  // 存储从 JSON 中加载的原始题目数据（只有 finnish 和 english 字段）
let questions = [];     // 存储处理后的题目（包括完整题目、选项、正确答案等）
let currentQuestionIndex = 0;

// 从 questions.json 文件加载数据
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    rawQuestions = data;
    // 针对每道题生成完整的题目数据：包括题目文本、选项和正确答案
    questions = rawQuestions.map(q => {
      // 筛选出干扰项，确保不会选到正确答案
      const availableDistractors = distractorPool.filter(d => d.english !== q.english);
      // 随机打乱干扰项数组
      const shuffled = availableDistractors.sort(() => 0.5 - Math.random());
      // 选择两个干扰项的英文翻译
      const chosenDistractors = shuffled.slice(0, 2).map(d => d.english);
      // 组合正确答案和干扰项
      let options = [q.english, ...chosenDistractors];
      // 随机打乱选项顺序
      options = options.sort(() => 0.5 - Math.random());
      return {
        // 生成题目文本（你可以按需要调整文本格式）
        question: `What is the English translation for the Finnish word "${q.finnish}"?`,
        options: options,
        answer: q.english,
        ttsText: q.english
      };
    });
    showQuestion();
  })
  .catch(error => console.error('Error loading quiz data:', error));

// 显示当前题目
function showQuestion() {
  const container = document.getElementById('question-container');
  container.innerHTML = '';  // 清空之前的内容

  if (questions.length === 0) return;

  const questionObj = questions[currentQuestionIndex];
  const questionElem = document.createElement('h2');
  questionElem.textContent = questionObj.question;
  container.appendChild(questionElem);

  // 创建每个选项按钮
  questionObj.options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option, questionObj.answer, questionObj.ttsText);
    container.appendChild(btn);
  });
}

// 检查答案并反馈
function checkAnswer(selected, correct, ttsText) {
  if (selected === correct) {
    alert('Correct!');
  } else {
    alert('Incorrect. The correct answer is: ' + correct);
  }
  speak(ttsText);
}

// 使用 Web Speech API 发音
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fi-FI';  // 设置语言为芬兰语
  speechSynthesis.speak(utterance);
}

// “Next Question”按钮点击事件
document.getElementById('next-btn').addEventListener('click', () => {
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
  showQuestion();
});
