// Dashboard JavaScript
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

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Load user info
async function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.name;
    }
}

// Load progress data
async function loadProgress() {
    try {
        const response = await fetch(`${API_URL}/progress`, {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to load progress');
        }
        
        const data = await response.json();
        updateProgressUI(data);
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Update progress UI
function updateProgressUI(data) {
    document.getElementById('currentLevel').textContent = data.currentLevel || 'Beginner';
    document.getElementById('avgScore').textContent = `${data.avgScore || 0}%`;
    document.getElementById('totalAttempts').textContent = data.totalAttempts || 0;
    
    // Render chart
    renderProgressChart(data.topicScores || []);
}

// Load recommendation
async function loadRecommendation() {
    try {
        const response = await fetch(`${API_URL}/recommendations/next`, {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load recommendation');
        }
        
        const data = await response.json();
        updateRecommendationUI(data);
    } catch (error) {
        console.error('Error loading recommendation:', error);
    }
}

// Update recommendation UI
function updateRecommendationUI(data) {
    document.getElementById('recommendedTopic').textContent = data.recommended_topic || 'General Revision';
    
    const badge = document.getElementById('difficultyAdjustment');
    badge.textContent = data.difficulty_adjustment || 'Maintain';
    
    badge.className = 'badge';
    if (data.difficulty_adjustment === 'Increase') {
        badge.classList.add('increase');
    } else if (data.difficulty_adjustment === 'Decrease') {
        badge.classList.add('decrease');
    } else {
        badge.classList.add('maintain');
    }
}

// Render progress chart
function renderProgressChart(topicScores) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topicScores.map(t => t.topic),
            datasets: [{
                label: 'Average Score (%)',
                data: topicScores.map(t => t.avgScore),
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Load topics
async function loadTopics() {
    try {
        const response = await fetch(`${API_URL}/topics`, {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load topics');
        }
        
        const topics = await response.json();
        renderTopics(topics);
    } catch (error) {
        console.error('Error loading topics:', error);
    }
}

// Render topics
function renderTopics(topics) {
    const container = document.getElementById('topicsList');
    container.innerHTML = '';
    
    topics.forEach(topic => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.onclick = () => openQuizModal(topic);
        
        card.innerHTML = `
            <h3>${topic.title}</h3>
            <p>${topic.description}</p>
            <span class="topic-difficulty ${topic.difficulty.toLowerCase()}">${topic.difficulty}</span>
        `;
        
        container.appendChild(card);
    });
}

// Load recommendation history
async function loadHistory() {
    try {
        const response = await fetch(`${API_URL}/recommendations/history`, {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load history');
        }
        
        const history = await response.json();
        renderHistory(history);
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Render history
function renderHistory(history) {
    const tbody = document.getElementById('historyTable');
    tbody.innerHTML = '';
    
    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No recommendations yet</td></tr>';
        return;
    }
    
    history.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.topicId?.title || 'N/A'}</td>
            <td><span class="topic-difficulty ${item.suggestedDifficulty?.toLowerCase()}">${item.suggestedDifficulty || 'N/A'}</span></td>
            <td>${item.reason || 'General recommendation'}</td>
            <td>${formatDate(item.generatedAt)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Quiz modal functions
function openQuizModal(topic) {
    document.getElementById('quizModal').style.display = 'block';
    document.getElementById('quizTopicName').textContent = topic.title;
    localStorage.setItem('selectedTopic', JSON.stringify(topic));
}

function closeModal() {
    document.getElementById('quizModal').style.display = 'none';
}

function startQuiz() {
    window.location.href = 'quiz.html';
}

// Initialize dashboard
async function init() {
    const token = checkAuth();
    if (!token) return;
    
    await loadUserInfo();
    await loadProgress();
    await loadRecommendation();
    await loadTopics();
    await loadHistory();
}

// Run on load
document.addEventListener('DOMContentLoaded', init);

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('quizModal');
    if (event.target === modal) {
        closeModal();
    }
};