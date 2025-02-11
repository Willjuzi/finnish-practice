// main.js

// 预定义的干扰项词库，可以根据需要扩充
const distractorPool = [
  { finnish: "hevonen", english: "horse" },
  { finnish: "lammas",  english: "sheep" },
  { finnish: "lehmä",   english: "cow" },
  { finnish: "kana",    english: "chicken" },
  { finnish: "sika",    english: "pig" }
];

let rawQuestions = [];   // 存储从 JSON 文件中加载的原始数据（只有 finnish 和 english 字段）
let questions = [];      // 生成后的完整题目数据（包含题目、选项、正确答案等）
let currentQuestionIndex = 0;

// 从 questions.json 文件加载数据
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    rawQuestions = data;
    // 根据录入的数据生成完整题目
    questions = rawQuestions.map(q => {
      // 筛选出干扰项，确保不会选到正确答案
      const availableDistractors = distractorPool.filter(d => d.english !== q.english);
      // 随机打乱干扰项数组，并选取三个干扰项
      const chosenDistractors = availableDistractors
                                  .sort(() => 0.5 - Math.random())
                                  .slice(0, 3)
                                  .map(d => d.english);
      // 组合正确答案与干扰项，然后随机打乱选项顺序
      let options = [q.english, ...chosenDistractors];
      options = options.sort(() => 0.5 - Math.random());
      return {
        // 题目只显示芬兰语单词
        question: q.finnish,
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

  // 显示题目（只显示芬兰语单词）
  const questionElem = document.createElement('h2');
  questionElem.textContent = questionObj.question;
  container.appendChild(questionElem);

  // 为每个选项创建按钮
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

// 更新后的语音朗读函数，尝试使用芬兰语的语音
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  // 指定语言为芬兰语
  utterance.lang = 'fi-FI';

  // 定义一个函数，用来设置支持芬兰语的语音
  const setFinnishVoice = () => {
    const voices = speechSynthesis.getVoices();
    // 查找语音列表中语言以 "fi" 开头的语音
    const finnishVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('fi'));
    if (finnishVoice) {
      utterance.voice = finnishVoice;
    }
    // 开始朗读
    speechSynthesis.speak(utterance);
  };

  // 如果语音列表尚未加载完成，则等待 voiceschanged 事件
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener('voiceschanged', setFinnishVoice);
  } else {
    setFinnishVoice();
  }
}

// “Next Question” 按钮的点击事件
document.getElementById('next-btn').addEventListener('click', () => {
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
  showQuestion();
});
