// Quiz JavaScript
const API_URL = 'https://your-backend-api.onrender.com/api';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    return token;
}

// Get auth headers
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Quiz state
let currentTopic = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeElapsed = 0;

// Initialize quiz page
async function init() {
    const token = checkAuth();
    if (!token) return;
    
    // Get selected topic
    const topicData = localStorage.getItem('selectedTopic');
    if (!topicData) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    currentTopic = JSON.parse(topicData);
    await loadTopics();
}

// Load available topics
async function loadTopics() {
    try {
        const response = await fetch(`${API_URL}/topics`, {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load topics');
        }
        
        const topics = await response.json();
        renderTopicSelection(topics);
    } catch (error) {
        console.error('Error loading topics:', error);
    }
}

// Render topic selection
function renderTopicSelection(topics) {
    const container = document.getElementById('topicSelection');
    container.innerHTML = '';
    
    topics.forEach(topic => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.onclick = () => selectTopic(topic);
        
        card.innerHTML = `
            <h3>${topic.title}</h3>
            <p>${topic.description}</p>
            <span class="topic-difficulty ${topic.difficulty.toLowerCase()}">${topic.difficulty}</span>
        `;
        
        container.appendChild(card);
    });
}

// Select topic and load questions
async function selectTopic(topic) {
    currentTopic = topic;
    
    try {
        // In a real app, you would fetch questions from the server
        // For demo, we'll generate sample questions
        questions = generateSampleQuestions(topic);
        
        // Show quiz interface
        document.getElementById('topicSelection').classList.add('hidden');
        document.getElementById('quizInterface').classList.remove('hidden');
        document.getElementById('quizTopicTitle').textContent = topic.title;
        
        // Initialize quiz state
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        timeElapsed = 0;
        
        // Start timer
        startTimer();
        
        // Render first question
        renderQuestion();
        
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load questions. Please try again.');
    }
}

// Generate sample questions (replace with real API)
function generateSampleQuestions(topic) {
    const questionBank = {
        'JavaScript Basics': [
            {
                question: 'What is the correct way to declare a variable in JavaScript?',
                options: ['var myVar', 'variable myVar', 'v myVar', 'declare myVar'],
                correct: 0
            },
            {
                question: 'Which method is used to add an element to the end of an array?',
                options: ['push()', 'pop()', 'shift()', 'unshift()'],
                correct: 0
            },
            {
                question: 'What does === operator do?',
                options: ['Assigns value', 'Compares value only', 'Compares value and type', 'Checks equality loosely'],
                correct: 2
            },
            {
                question: 'Which keyword is used to define a function in JavaScript?',
                options: ['function', 'func', 'def', 'lambda'],
                correct: 0
            },
            {
                question: 'What is the output of typeof null?',
                options: ['null', 'undefined', 'object', 'string'],
                correct: 2
            }
        ],
        'React Fundamentals': [
            {
                question: 'What is JSX?',
                options: ['A database', 'A JavaScript syntax extension', 'A CSS framework', 'A build tool'],
                correct: 1
            },
            {
                question: 'Which hook is used for side effects in React?',
                options: ['useState', 'useEffect', 'useContext', 'useReducer'],
                correct: 1
            },
            {
                question: 'How do you pass data from parent to child component?',
                options: ['State', 'Props', 'Context', 'Ref'],
                correct: 1
            },
            {
                question: 'What is the purpose of useState?',
                options: ['Manage side effects', 'Manage component state', 'Access DOM', 'Create context'],
                correct: 1
            },
            {
                question: 'Which method is called first when a component mounts?',
                options: ['componentWillMount', 'componentDidMount', 'componentWillUpdate', 'render'],
                correct: 1
            }
        ],
        'Node.js Essentials': [
            {
                question: 'What is Express.js?',
                options: ['A database', 'A web application framework', 'A programming language', 'A CSS framework'],
                correct: 1
            },
            {
                question: 'Which module is used for file system operations?',
                options: ['http', 'fs', 'path', 'url'],
                correct: 1
            },
            {
                question: 'What is middleware in Express?',
                options: ['A database', 'Functions executed before route handlers', 'A template engine', 'A routing method'],
                correct: 1
            },
            {
                question: 'How do you export a module in Node.js?',
                options: ['module.export', 'export default', 'module.exports', 'exports'],
                correct: 2
            },
            {
                question: 'What is npm?',
                options: ['Node Package Manager', 'New Package Manager', 'Node Project Manager', 'Network Package Manager'],
                correct: 0
            }
        ]
    };
    
    // Return questions for the topic or default questions
    return questionBank[topic.title] || questionBank['JavaScript Basics'];
}

// Render current question
function renderQuestion() {
    const question = questions[currentQuestionIndex];
    
    document.getElementById('questionNum').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        if (userAnswers[currentQuestionIndex] === index) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <input type="radio" name="answer" value="${index}" 
                ${user