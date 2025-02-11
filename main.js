// main.js

let questions = [];
let currentQuestionIndex = 0;

// 从 questions.json 文件加载题库数据
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
      questions = data;
      showQuestion();  // 数据加载完成后显示题目
  })
  .catch(error => console.error('加载题库出错：', error));

// 显示当前题目
function showQuestion() {
    const container = document.getElementById('question-container');
    container.innerHTML = '';  // 清空旧内容

    // 防止在数据还未加载完成时调用此函数
    if (questions.length === 0) return;

    const questionObj = questions[currentQuestionIndex];

    // 创建题目文本
    const questionElem = document.createElement('h2');
    questionElem.textContent = questionObj.question;
    container.appendChild(questionElem);

    // 创建选项按钮
    questionObj.options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, questionObj.answer, questionObj.ttsText);
        container.appendChild(btn);
    });
}

// 检查答案并进行反馈
function checkAnswer(selected, correct, ttsText) {
    if (selected === correct) {
        alert('回答正确！');
    } else {
        alert('回答错误，正确答案是：' + correct);
    }
    speak(ttsText);
}

// 使用 Web Speech API 进行发音
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fi-FI'; // 设置为芬兰语
    speechSynthesis.speak(utterance);
}

// “下一题”按钮的事件监听
document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    showQuestion();
});
