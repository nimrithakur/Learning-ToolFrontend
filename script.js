// ============================================
// Global State
// ============================================
let currentData = null;
let quizAnswers = {};

// ============================================
// Theme Management
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Process button
    document.getElementById('processBtn').addEventListener('click', processVideo);
    
    // Process transcript button
    document.getElementById('processTranscriptBtn').addEventListener('click', processTranscript);
    
    // Character counter for transcript
    const transcriptInput = document.getElementById('transcriptInput');
    transcriptInput.addEventListener('input', updateCharCounter);
    
    // Enter key on input
    document.getElementById('videoUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processVideo();
        }
    });
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
});

// ============================================
// Mode Switching
// ============================================
function switchMode(mode) {
    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Show/hide input modes
    document.getElementById('urlMode').classList.toggle('active', mode === 'url');
    document.getElementById('transcriptMode').classList.toggle('active', mode === 'transcript');
    
    // Reset error state
    hideAllSections();
}

// ============================================
// Character Counter
// ============================================
function updateCharCounter() {
    const transcriptInput = document.getElementById('transcriptInput');
    const charCount = document.getElementById('charCount');
    const counter = charCount.parentElement;
    
    const length = transcriptInput.value.length;
    charCount.textContent = length.toLocaleString();
    
    // Update counter color based on length
    counter.classList.remove('warning', 'error');
    if (length > 45000) {
        counter.classList.add('error');
    } else if (length > 40000) {
        counter.classList.add('warning');
    }
}

// ============================================
// Process Transcript Function
// ============================================
async function processTranscript() {
    const transcript = document.getElementById('transcriptInput').value.trim();
    
    if (!transcript) {
        showError('Please paste a transcript');
        return;
    }
    
    if (transcript.length < 100) {
        showError('Transcript is too short. Please provide at least 100 characters.');
        return;
    }
    
    if (transcript.length > 50000) {
        showError('Transcript is too long. Please limit to 50,000 characters.');
        return;
    }
    
    // Reset states
    hideAllSections();
    document.getElementById('loadingState').classList.remove('hidden');
    
    // Simulate loading steps animation
    animateLoadingSteps();
    
    try {
        const response = await fetch('/api/process-transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transcript })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to process transcript');
        }
        
        currentData = result.data;
        displayResults(result.data);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
    }
}

// ============================================
// Main Process Function
// ============================================
async function processVideo() {
    const videoUrl = document.getElementById('videoUrl').value.trim();
    
    if (!videoUrl) {
        showError('Please enter a YouTube video URL');
        return;
    }
    
    // Reset states
    hideAllSections();
    document.getElementById('loadingState').classList.remove('hidden');
    
    // Simulate loading steps animation
    animateLoadingSteps();
    
    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoUrl })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to process video');
        }
        
        currentData = result.data;
        displayResults(result.data);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
    }
}

// ============================================
// Loading Animation
// ============================================
function animateLoadingSteps() {
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            steps.forEach((step, index) => {
                step.classList.toggle('active', index === currentStep);
            });
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 1500);
}

// ============================================
// Display Results
// ============================================
function displayResults(data) {
    hideAllSections();
    
    // Video info
    document.getElementById('videoTitle').textContent = data.title;
    document.getElementById('processingTime').textContent = `${(data.metadata.processingTime / 1000).toFixed(2)}s`;
    document.getElementById('transcriptLength').textContent = `${data.metadata.transcriptLength} chars`;
    
    // Summary
    displaySummary(data.summary);
    
    // Key Points
    displayKeyPoints(data.keyPoints);
    
    // Quiz
    displayQuiz(data.quiz);
    
    // Show results section
    document.getElementById('resultsSection').classList.remove('hidden');
    
    // Smooth scroll to results
    document.getElementById('resultsSection').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// ============================================
// Display Summary
// ============================================
function displaySummary(summary) {
    const summaryContent = document.getElementById('summaryContent');
    
    // Split into paragraphs
    const paragraphs = summary.split('\n\n').filter(p => p.trim());
    
    summaryContent.innerHTML = paragraphs
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('');
}

// ============================================
// Display Key Points
// ============================================
function displayKeyPoints(keyPoints) {
    const keypointsContent = document.getElementById('keypointsContent');
    
    keypointsContent.innerHTML = `
        <ul class="key-points-list">
            ${keyPoints.map(point => `
                <li>${escapeHtml(point)}</li>
            `).join('')}
        </ul>
    `;
}

// ============================================
// Display Quiz
// ============================================
function displayQuiz(quiz) {
    const quizContent = document.getElementById('quizContent');
    quizAnswers = {};
    
    quizContent.innerHTML = quiz.map((q, index) => `
        <div class="quiz-question" data-question-id="${q.id}">
            <div class="question-number">Question ${q.id}</div>
            <div class="question-text">${escapeHtml(q.question)}</div>
            <div class="quiz-options">
                ${q.options.map((option, optIndex) => `
                    <label class="quiz-option">
                        <input 
                            type="radio" 
                            name="question-${q.id}" 
                            value="${String.fromCharCode(65 + optIndex)}"
                            onchange="selectAnswer(${q.id}, '${String.fromCharCode(65 + optIndex)}')"
                        >
                        <span>${String.fromCharCode(65 + optIndex)}. ${escapeHtml(option)}</span>
                    </label>
                `).join('')}
            </div>
            <div class="explanation hidden" data-explanation="${q.id}">
                <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
            </div>
        </div>
    `).join('');
    
    // Reset quiz UI
    document.getElementById('submitQuiz').classList.remove('hidden');
    document.getElementById('resetQuiz').classList.add('hidden');
    document.getElementById('quizScore').classList.add('hidden');
}

// ============================================
// Quiz Functions
// ============================================
function selectAnswer(questionId, answer) {
    quizAnswers[questionId] = answer;
}

function submitQuiz() {
    if (!currentData || !currentData.quiz) return;
    
    const totalQuestions = currentData.quiz.length;
    let correctCount = 0;
    
    currentData.quiz.forEach(q => {
        const questionEl = document.querySelector(`[data-question-id="${q.id}"]`);
        const selectedAnswer = quizAnswers[q.id];
        const options = questionEl.querySelectorAll('.quiz-option');
        const explanationEl = questionEl.querySelector(`[data-explanation="${q.id}"]`);
        
        // Show explanation
        explanationEl.classList.remove('hidden');
        
        // Mark correct/incorrect
        options.forEach(option => {
            const input = option.querySelector('input');
            const value = input.value;
            
            if (value === q.correctAnswer) {
                option.classList.add('correct');
            } else if (value === selectedAnswer && value !== q.correctAnswer) {
                option.classList.add('incorrect');
            }
            
            // Disable further selection
            input.disabled = true;
        });
        
        // Count correct answers
        if (selectedAnswer === q.correctAnswer) {
            correctCount++;
        }
    });
    
    // Show score
    document.getElementById('scoreValue').textContent = correctCount;
    document.getElementById('quizScore').classList.remove('hidden');
    
    // Hide submit, show reset
    document.getElementById('submitQuiz').classList.add('hidden');
    document.getElementById('resetQuiz').classList.remove('hidden');
    
    // Scroll to score
    document.getElementById('quizScore').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
}

function resetQuiz() {
    if (!currentData) return;
    
    displayQuiz(currentData.quiz);
    document.getElementById('quizScore').classList.add('hidden');
}

// ============================================
// Tab Switching
// ============================================
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === tabName);
    });
}

// ============================================
// Copy to Clipboard
// ============================================
async function copyContent(elementId) {
    const element = document.getElementById(elementId);
    const text = element.innerText;
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('✅ Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('❌ Failed to copy');
    }
}

// ============================================
// Download Content
// ============================================
function downloadContent() {
    if (!currentData) return;
    
    const content = `
===========================================
SMART VIDEO LEARNING TOOL - STUDY NOTES
===========================================

Video: ${currentData.title}
Generated: ${new Date(currentData.metadata.generatedAt).toLocaleString()}

===========================================
SUMMARY
===========================================

${currentData.summary}

===========================================
KEY LEARNING POINTS
===========================================

${currentData.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n\n')}

===========================================
QUIZ QUESTIONS (10)
===========================================

${currentData.quiz.map((q, i) => `
Question ${i + 1}: ${q.question}

${q.options.map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}

Correct Answer: ${q.correctAnswer}
Explanation: ${q.explanation}
`).join('\n---\n')}

===========================================
Generated by Smart Video Learning Tool
===========================================
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-notes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('✅ Downloaded successfully!');
}

// ============================================
// Process New Video
// ============================================
function processNewVideo() {
    hideAllSections();
    document.getElementById('videoUrl').value = '';
    document.getElementById('videoUrl').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Error Handling
// ============================================
function showError(message) {
    hideAllSections();
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorState').classList.remove('hidden');
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--color-primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--border-radius-sm);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ============================================
// Utility Functions
// ============================================
function hideAllSections() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Animations (CSS)
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
