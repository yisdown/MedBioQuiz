const API_URL = 'http://localhost:3000';

const categoryList = document.getElementById('categoryList');
const startBtn = document.getElementById('startBtn');
const home = document.getElementById('homeScreen');
const quiz = document.getElementById('quizScreen');
const results = document.getElementById('resultScreen');
const questionText = document.getElementById('questionText');
const answers = document.getElementById('answers');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const nextBtn = document.getElementById('nextBtn');
const questionNumber = document.getElementById('questionNumber');
const progressFill = document.getElementById('progressFill');
const restartBtn = document.getElementById('restartBtn');

const MAX_CATEGORIES = 5;

let selectedCategories = []; // holds up to 2 category names, or ['TEST']
let questions = [];
let index = 0;
let score = 0;
let submitted = false;
let selected = [];

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/api/categories`);
        const categories = await response.json();

        categoryList.innerHTML = '';

        // Test card: 35 random questions pulled from every category
        const testBtn = document.createElement('button');
        testBtn.className = 'category';
        testBtn.textContent = 'Test Admitere 35 intrebari';
        testBtn.dataset.category = 'TEST';
        testBtn.onclick = () => selectTest(testBtn);
        categoryList.append(testBtn);

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category';
            btn.textContent = cat;
            btn.dataset.category = cat;
            btn.onclick = () => toggleCategory(cat, btn);
            categoryList.append(btn);
        });
    } catch (error) {
        categoryList.innerHTML = `<p style="color:red;">Failed to load categories. Make sure server is running.</p>`;
    }
}

function selectTest(testBtn) {
    selectedCategories = ['TEST'];
    document.querySelectorAll('.category').forEach(x => x.classList.remove('selected'));
    testBtn.classList.add('selected');
    startBtn.disabled = false;
}

function toggleCategory(cat, btn) {
    // picking a normal category cancels Test mode
    if (selectedCategories.includes('TEST')) {
        selectedCategories = [];
        document.querySelectorAll('.category').forEach(x => x.classList.remove('selected'));
    }

    const i = selectedCategories.indexOf(cat);

    if (i > -1) {
        // already selected, so unselect it
        selectedCategories.splice(i, 1);
        btn.classList.remove('selected');
    } else if (selectedCategories.length < MAX_CATEGORIES) {
        selectedCategories.push(cat);
        btn.classList.add('selected');
    }
    // if 2 are already picked, clicking a 3rd does nothing until one is unselected

    startBtn.disabled = selectedCategories.length === 0;
}

startBtn.onclick = async () => {
    if (selectedCategories.length === 0) return;

    try {
        const url = buildQuestionsUrl();
        const response = await fetch(url);
        const data = await response.json();
        questions = data.questions;

        totalEl.textContent = questions.length;
        score = 0;
        index = 0;
        scoreEl.textContent = score;

        show('quiz');
        render();
    } catch (error) {
        alert('Failed to load questions. Please try again.');
    }
};

function buildQuestionsUrl() {

    if (selectedCategories.includes('TEST')) {
        return `${API_URL}/api/random?limit=35`;
    }

    // Multiple categories (2+)
    if (selectedCategories.length >= 2) {

        const categories =
            encodeURIComponent(
                selectedCategories.join(',')
            );

        return `${API_URL}/api/multi?categories=${categories}&limit=50`;
    }

    // Single category
    return `${API_URL}/api/questions?category=${encodeURIComponent(
        selectedCategories[0]
    )}`;
}

function render() {
    submitted = false;
    selected = [];

    const q = questions[index];
    const label = q.category ? ` · ${q.category}` : '';
    questionNumber.textContent = `Question ${index + 1} / ${questions.length}${label}`;
    questionText.textContent = q.question;

    answers.innerHTML = '';

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'answer';
        btn.textContent = opt;
        btn.onclick = () => toggle(btn, i);
        answers.append(btn);
    });

    nextBtn.textContent = 'Submit Answer';
    progress();
}

function toggle(btn, i) {
    if (submitted) return;
    btn.classList.toggle('selected');

    if (selected.includes(i)) {
        selected = selected.filter(x => x !== i);
    } else {
        selected.push(i);
    }
}

nextBtn.onclick = () => {
    if (!submitted) {
        if (selected.length === 0) {
            alert('Please select at least one answer.');
            return;
        }
        grade();
        return;
    }

    index++;
    if (index >= questions.length) {
        finish();
        return;
    }

    render();
};

function grade() {
    submitted = true;
    nextBtn.textContent = 'Next Question';

    const q = questions[index];
    const buttons = document.querySelectorAll('.answer');

    buttons.forEach((btn, i) => {
        btn.classList.add('disabled');
        if (q.answers.includes(i)) btn.classList.add('correct');
        if (selected.includes(i) && !q.answers.includes(i)) btn.classList.add('wrong');
    });

    const correct = selected.length === q.answers.length &&
                    selected.every(x => q.answers.includes(x));

    if (correct) score++;
    scoreEl.textContent = score;
}

function finish() {
    show('result');
    document.getElementById('finalScore').textContent = `You scored ${score}/${questions.length}`;
    const percentage = Math.round(score / questions.length * 100);
    document.getElementById('percentage').textContent = `${percentage}%`;
}

function progress() {
    progressFill.style.width = ((index / questions.length) * 100) + '%';
}

function show(id) {
    [home, quiz, results].forEach(x => x.classList.remove('active'));
    document.getElementById(id + 'Screen').classList.add('active');
}

restartBtn.onclick = () => location.reload();

loadCategories();