const API = "http://localhost:5000";

const questions = [
  { q: "HTML stands for?", a: ["Hyper Text Markup Language", "Home Tool Markup", "Hyperlinks"], c: 0 },
  { q: "CSS used for?", a: ["Structure", "Styling", "Database"], c: 1 },
  { q: "JS is?", a: ["Programming Language", "Markup", "Style"], c: 0 },
  { q: "Node.js runs on?", a: ["Browser", "Server", "Database"], c: 1 },
  { q: "React is?", a: ["Framework", "Library", "Database"], c: 1 }
];

let current = 0;
let score = 0;

/* START QUIZ */

function startQuiz() {
  const user = document.getElementById("username").value;
  localStorage.setItem("user", user);
  window.location = "quiz.html";
}

/* SHOW ONE QUESTION */

function showQuestion() {
  const quizDiv = document.getElementById("quiz");
  const q = questions[current];

  quizDiv.innerHTML = `
    <div class="question-card">
      <h3>Q${current + 1}. ${q.q}</h3>
      ${q.a.map((opt, i) =>
        `<label>
          <input type="radio" name="ans" value="${i}">
          ${opt}
        </label><br>`
      ).join("")}
    </div>
  `;
}

/* NEXT BUTTON */

function nextQuestion() {
  const selected = document.querySelector('input[name="ans"]:checked');

  if (!selected) {
    alert("Please select an answer");
    return;
  }

  if (parseInt(selected.value) === questions[current].c) score++;

  current++;

  if (current < questions.length) {
    showQuestion();
  } else {
    submitQuiz();
  }
}

/* SUBMIT + RESULT */

function submitQuiz() {

  fetch(API + "/submit", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user: localStorage.getItem("user"),
      score: score
    })
  })
  .then(res => res.json())
  .then(data => {
    document.body.innerHTML = `
      <h2>Quiz Completed ✅</h2>
      <h3>Your Score: ${score} / ${questions.length}</h3>
      <h3>Level: ${data.level}</h3>
      <h3>Recommended Topic: ${data.topic}</h3>
      <h3>Difficulty: ${data.difficulty}</h3>
    `;
  });
}

/* LOAD FIRST QUESTION */

if (document.getElementById("quiz")) {
  showQuestion();
}

