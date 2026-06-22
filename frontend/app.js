const API_URL = 'https://medbioquiz.onrender.com';

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

let selectedCategories = [];
let questions = [];
let index = 0;
let score = 0;
let submitted = false;
let selected = [];
let answerButtons = []; // 🔥 IMPORTANT: store buttons directly

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/api/categories`);
        const categories = await response.json();

        categoryList.innerHTML = '';

        const testBtn = document.createElement('button');
        testBtn.className = 'category';
        testBtn.textContent = 'Test Admitere 35 intrebari';
        testBtn.onclick = () => selectTest(testBtn);
        categoryList.append(testBtn);

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category';
            btn.textContent = cat;
            btn.onclick = () => toggleCategory(cat, btn);
            categoryList.append(btn);
        });

    } catch (error) {
        categoryList.innerHTML =
            `<p style="color:red;">Failed to load categories.</p>`;
    }
}

function selectTest(testBtn) {
    selectedCategories = ['TEST'];

    document.querySelectorAll('.category')
        .forEach(x => x.classList.remove('selected'));

    testBtn.classList.add('selected');
    startBtn.disabled = false;
}

function toggleCategory(cat, btn) {
    if (selectedCategories.includes('TEST')) {
        selectedCategories = [];
        document.querySelectorAll('.category')
            .forEach(x => x.classList.remove('selected'));
    }

    const i = selectedCategories.indexOf(cat);

    if (i > -1) {
        selectedCategories.splice(i, 1);
        btn.classList.remove('selected');
    } else if (selectedCategories.length < MAX_CATEGORIES) {
        selectedCategories.push(cat);
        btn.classList.add('selected');
    }

    startBtn.disabled = selectedCategories.length === 0;
}

startBtn.onclick = async () => {
    if (!selectedCategories.length) return;

    try {
        const url = buildQuestionsUrl();
        const res = await fetch(url);
        const data = await res.json();

        questions = data.questions;

        index = 0;
        score = 0;

        totalEl.textContent = questions.length;
        scoreEl.textContent = score;

        show('quiz');
        render();

    } catch (e) {
        alert('Failed to load questions.');
    }
};

function buildQuestionsUrl() {
    if (selectedCategories.includes('TEST')) {
        return `${API_URL}/api/random?limit=35`;
    }

    if (selectedCategories.length >= 2) {
        return `${API_URL}/api/multi?categories=${encodeURIComponent(
            selectedCategories.join(',')
        )}&limit=50`;
    }

    return `${API_URL}/api/questions?category=${encodeURIComponent(
        selectedCategories[0]
    )}`;
}

function render() {
    submitted = false;
    selected = [];
    answerButtons = [];

    const q = questions[index];

    questionNumber.textContent =
        `Question ${index + 1} / ${questions.length} · ${q.category || ''}`;

    questionText.textContent = q.question;

    answers.innerHTML = '';

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');

        btn.className = 'answer';
        btn.textContent = opt;

        // Mobile: touchend fires first — call toggle and cancel
        // the ghost click that would fire ~300ms later.
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            toggle(btn, i);
        }, { passive: false });

        // Desktop: only a real click fires here (no preceding touchend).
        btn.addEventListener('click', () => toggle(btn, i));

        answers.appendChild(btn);
        answerButtons[i] = btn;
    });

    nextBtn.textContent = 'Submit Answer';

    progress();
}

function toggle(btn, i) {
    if (submitted) return;

    const exists = selected.indexOf(i);

    if (exists > -1) {
        selected.splice(exists, 1);
        btn.classList.remove('selected');
    } else {
        selected.push(i);
        btn.classList.add('selected');
    }
}

nextBtn.onclick = () => {
    if (!submitted) {
        if (!selected.length) {
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

    answerButtons.forEach((btn, i) => {
        const isCorrect = q.answers.includes(i);
        const isSelected = selected.includes(i);
        
        btn.classList.add('disabled');

        if (isCorrect && isSelected) {
            btn.classList.add('correct');
        }

        if (isCorrect && !isSelected) {
            btn.classList.add('missed');
        }

        if (!isCorrect && isSelected) {
            btn.classList.add('wrong');
        }
    });

    const correct =
        selected.length === q.answers.length &&
        selected.every(x => q.answers.includes(x));

    if (correct) score++;

    scoreEl.textContent = score;
}

function finish() {
    show('result');

    document.getElementById('finalScore')
        .textContent = `You scored ${score}/${questions.length}`;

    const percent =
        Math.round((score / questions.length) * 100);

    document.getElementById('percentage')
        .textContent = `${percent}%`;
}

function progress() {
    progressFill.style.width =
        `${(index / questions.length) * 100}%`;
}

function show(id) {
    [home, quiz, results].forEach(x => x.classList.remove('active'));
    document.getElementById(id + 'Screen').classList.add('active');
}

restartBtn.onclick = () => location.reload();

loadCategories();