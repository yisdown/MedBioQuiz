# 🧬 Med Bio Quiz

A free and open-source quiz platform designed to help students prepare for the **Biology admission exam for Medical Faculty**.

The website includes **1500+ practice questions** across **12 different categories**, allowing students to train by topic and improve their exam preparation.

## 🌐 Live Demo

Visit the website here:

https://med-bio-quiz.vercel.app

---

## 🚀 Run Locally

Clone the repository:

```bash
git clone https://github.com/your-username/MedBioQuiz.git
cd MedBioQuiz
```

Start the backend:

```bash
cd backend
npm start
```

Then open:

```text
index.html
```

in your browser.

---

## 📚 Question Format

To add new questions, edit:

```text
/backend/data/new_questions.js
```

### Rules

* Each question should contain **5 answer options**
* `answers` must be an array containing the indexes of all correct answers

Example:

```js
{
  question: "Example question",
  options: [
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Option E"
  ],
  answers: [0, 2, 4]
}
```

---

## ✨ Features

* 1500+ Biology questions
* 12 study categories
* Multiple-answer support
* Progress tracking
* Lightweight and easy to run
* Open source

---

## 📄 License

This project is open source and available under the MIT License.
