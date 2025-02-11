// main.js

let questions = [];
let currentQuestionIndex = 0;

// Load quiz data from questions.json
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
      questions = data;
      showQuestion();  // Display the first question after data is loaded
  })
  .catch(error => console.error('Error loading quiz data:', error));

// Display the current question
function showQuestion() {
    const container = document.getElementById('question-container');
    container.innerHTML = '';  // Clear previous content

    // Ensure that questions have been loaded
    if (questions.length === 0) return;

    const questionObj = questions[currentQuestionIndex];

    // Create and display the question text
    const questionElem = document.createElement('h2');
    questionElem.textContent = questionObj.question;
    container.appendChild(questionElem);

    // Create and display the option buttons
    questionObj.options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, questionObj.answer, questionObj.ttsText);
        container.appendChild(btn);
    });
}

// Check the answer and provide feedback
function checkAnswer(selected, correct, ttsText) {
    if (selected === correct) {
        alert('Correct!');
    } else {
        alert('Incorrect. The correct answer is: ' + correct);
    }
    speak(ttsText);
}

// Use the Web Speech API to pronounce the word
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fi-FI'; // Set language to Finnish
    speechSynthesis.speak(utterance);
}

// Add event listener for the "Next Question" button
document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    showQuestion();
});
