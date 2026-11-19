"""
AI Interview Engine - Question generation and answer evaluation (algorithmic).
LLM integration can be dropped in behind the service layer.
"""
import re
import random
from typing import List, Dict

QUESTION_BANK = {
    'python': {
        'technical': [
            "Explain the difference between a list and a tuple in Python.",
            "What are Python decorators and when would you use them?",
            "How does Python's GIL affect multithreading?",
            "Explain list comprehension with an example.",
            "What is the difference between deepcopy and copy?",
            "Explain generators and how they differ from regular functions.",
            "What are *args and **kwargs in Python?",
        ],
        'problem_solving': [
            "Write a function to reverse a string without using built-in reverse methods.",
            "How would you find duplicates in a list efficiently?",
            "Explain how you would implement a basic cache using Python.",
        ],
    },
    'django': {
        'technical': [
            "Explain Django's MVT architecture.",
            "What is Django ORM and what are its advantages?",
            "How does Django's middleware work?",
            "What is the difference between select_related and prefetch_related?",
            "Explain Django signals and give a use case.",
            "How would you implement authentication in Django REST Framework?",
        ],
        'problem_solving': [
            "How would you optimize a slow Django queryset?",
            "Describe how you would implement pagination in a DRF API.",
        ],
    },
    'react': {
        'technical': [
            "Explain the difference between state and props in React.",
            "What are React hooks? Explain useState and useEffect.",
            "What is the virtual DOM and how does React use it?",
            "What is the Context API and when would you use it?",
        ],
        'problem_solving': [
            "How would you manage global state in a large React application?",
            "Describe how you would handle API calls in React.",
        ],
    },
    'sql': {
        'technical': [
            "Explain the difference between INNER JOIN and LEFT JOIN.",
            "What is database normalization? Explain 1NF, 2NF, 3NF.",
            "What are indexes and when should you use them?",
            "Explain the difference between GROUP BY and HAVING.",
        ],
        'problem_solving': [
            "How would you find the second highest salary from an employees table?",
            "Write a query to find all students who have not submitted any assignment.",
        ],
    },
    'machine learning': {
        'technical': [
            "Explain the difference between supervised and unsupervised learning.",
            "What is overfitting and how do you prevent it?",
            "Explain the bias-variance tradeoff.",
            "What is cross-validation and why is it important?",
        ],
        'problem_solving': [
            "How would you approach a classification problem with imbalanced data?",
            "Describe the steps you would take to build a recommendation system.",
        ],
    },
    'general': {
        'hr': [
            "Tell me about yourself and your technical background.",
            "Why are you interested in this role?",
            "Describe a challenging project you worked on and how you handled it.",
            "What are your greatest technical strengths?",
            "Where do you see yourself in 3 years?",
            "How do you handle tight deadlines and multiple tasks?",
        ],
        'behavioral': [
            "Tell me about a time you failed and what you learned from it.",
            "Describe a time you showed leadership in a project.",
            "Give an example of how you handled constructive criticism.",
        ],
        'communication': [
            "Explain a complex technical concept you recently learned to someone non-technical.",
            "Describe a situation where you had to work in a team and handle a disagreement.",
            "How do you ensure clear communication when working remotely?",
        ],
    },
}


def generate_interview_questions(target_role: str, student_skills: List[str], num_questions: int = 8) -> List[Dict]:
    role_lower = target_role.lower()
    skill_areas = []

    if any(k in role_lower for k in ['python', 'backend', 'django']):
        skill_areas.extend(['python', 'django', 'sql'])
    if any(k in role_lower for k in ['frontend', 'react', 'ui']):
        skill_areas.extend(['react'])
    if any(k in role_lower for k in ['data', 'ml', 'ai', 'machine']):
        skill_areas.extend(['python', 'sql', 'machine learning'])
    if any(k in role_lower for k in ['full stack', 'fullstack']):
        skill_areas.extend(['python', 'django', 'react', 'sql'])

    for skill in student_skills:
        if skill.lower() in QUESTION_BANK:
            skill_areas.append(skill.lower())

    skill_areas = list(set(skill_areas))

    tech_questions = []
    for area in skill_areas:
        if area in QUESTION_BANK:
            bank = QUESTION_BANK[area]
            for q in bank.get('technical', []):
                tech_questions.append({'text': q, 'type': 'technical', 'area': area})
            for q in bank.get('problem_solving', []):
                tech_questions.append({'text': q, 'type': 'problem_solving', 'area': area})

    hr_questions = [{'text': q, 'type': 'hr', 'area': 'general'} for q in QUESTION_BANK['general']['hr']]
    behavioral_questions = [{'text': q, 'type': 'behavioral', 'area': 'general'} for q in QUESTION_BANK['general']['behavioral']]
    comm_questions = [{'text': q, 'type': 'communication', 'area': 'general'} for q in QUESTION_BANK['general']['communication']]

    random.shuffle(tech_questions)
    random.shuffle(hr_questions)

    tech_count = max(1, int(num_questions * 0.5))
    hr_count = max(1, int(num_questions * 0.25))
    behavioral_count = max(1, int(num_questions * 0.15))
    comm_count = num_questions - tech_count - hr_count - behavioral_count

    selected = (
        tech_questions[:tech_count] +
        hr_questions[:hr_count] +
        behavioral_questions[:behavioral_count] +
        comm_questions[:max(comm_count, 0)]
    )

    while len(selected) < num_questions:
        selected.append({'text': "Tell me more about your experience.", 'type': 'hr', 'area': 'general'})

    return [
        {
            'order': i + 1,
            'question_text': q['text'],
            'question_type': q['type'],
            'expected_topics': [],
        }
        for i, q in enumerate(selected[:num_questions])
    ]


def evaluate_answer(question_text: str, transcript: str, question_type: str) -> Dict:
    if not transcript or len(transcript.strip()) < 10:
        return {
            'relevance_score': 0.0,
            'technical_accuracy': 0.0,
            'communication_clarity': 0.0,
            'word_count': 0,
            'feedback': 'No answer provided or answer was too short.',
        }

    word_count = len(transcript.split())
    sentences = re.split(r'[.!?]+', transcript)
    sentence_count = max(len(sentences), 1)
    avg_sentence_len = word_count / sentence_count

    # Relevance: keyword overlap between question and answer
    q_keywords = set(re.findall(r'\b[a-zA-Z]{4,}\b', question_text.lower()))
    a_keywords = set(re.findall(r'\b[a-zA-Z]{4,}\b', transcript.lower()))
    overlap = q_keywords & a_keywords
    relevance = min(100.0, (len(overlap) / max(len(q_keywords), 1)) * 100 + 30)

    # Communication clarity
    clarity = 50.0
    if word_count >= 50:
        clarity += 20
    if word_count >= 100:
        clarity += 10
    if 5 < avg_sentence_len < 30:
        clarity += 20

    # Technical accuracy heuristic
    tech_keywords = {
        'function', 'class', 'variable', 'database', 'query', 'algorithm',
        'data', 'model', 'method', 'object', 'component', 'api', 'server',
        'memory', 'performance', 'optimize', 'implement', 'design', 'pattern'
    }
    tech_overlap = tech_keywords & a_keywords
    tech_score = min(100.0, 40 + len(tech_overlap) * 8)

    feedback_parts = []
    if word_count < 30:
        feedback_parts.append("Your answer was quite brief. Try to elaborate more.")
    elif word_count > 150:
        feedback_parts.append("Good detailed response.")
    if relevance < 40:
        feedback_parts.append("Try to focus your answer more directly on the question.")
    elif relevance >= 70:
        feedback_parts.append("Your answer was relevant to the question.")

    return {
        'relevance_score': round(min(100.0, relevance), 1),
        'technical_accuracy': round(tech_score, 1) if question_type in ('technical', 'problem_solving') else 50.0,
        'communication_clarity': round(min(100.0, clarity), 1),
        'word_count': word_count,
        'feedback': ' '.join(feedback_parts) if feedback_parts else 'Satisfactory response.',
    }


def evaluate_full_interview(answers: List[Dict]) -> Dict:
    if not answers:
        return {
            'technical_score': 0, 'communication_score': 0,
            'problem_solving_score': 0, 'answer_relevance_score': 0,
            'confidence_score': 50, 'overall_score': 0,
            'strengths': [], 'improvements': [],
            'evaluation_summary': 'No answers recorded.',
        }

    tech_scores = [a['technical_accuracy'] for a in answers if a.get('technical_accuracy') is not None]
    comm_scores = [a['communication_clarity'] for a in answers if a.get('communication_clarity') is not None]
    relevance_scores = [a['relevance_score'] for a in answers if a.get('relevance_score') is not None]

    avg_tech = sum(tech_scores) / len(tech_scores) if tech_scores else 50
    avg_comm = sum(comm_scores) / len(comm_scores) if comm_scores else 50
    avg_relevance = sum(relevance_scores) / len(relevance_scores) if relevance_scores else 50
    ps_score = avg_tech * 0.6 + avg_relevance * 0.4

    word_counts = [a.get('word_count', 50) for a in answers]
    avg_words = sum(word_counts) / max(len(word_counts), 1)
    confidence_score = min(100, 50 + (avg_words - 30) * 0.5)

    overall = (
        avg_tech * 0.30 + avg_comm * 0.25 +
        avg_relevance * 0.25 + ps_score * 0.15 + confidence_score * 0.05
    )

    strengths, improvements = [], []
    if avg_tech >= 75:
        strengths.append("Good technical knowledge demonstrated")
    else:
        improvements.append("Deepen technical understanding with more practice and examples")

    if avg_comm >= 75:
        strengths.append("Clear and articulate communication")
    else:
        improvements.append("Work on communication clarity and answer structure")

    if avg_relevance >= 70:
        strengths.append("Answers were well-targeted to the questions")
    else:
        improvements.append("Focus answers more directly on what was asked")

    if confidence_score >= 70:
        strengths.append("Confident and detailed responses")
    else:
        improvements.append("Provide more detailed explanations and real-world examples")

    summary = (
        f"Overall interview performance: {round(overall, 1)}/100. "
        f"Technical: {round(avg_tech, 1)}/100, "
        f"Communication: {round(avg_comm, 1)}/100, "
        f"Answer Relevance: {round(avg_relevance, 1)}/100. "
    )

    return {
        'technical_score': round(avg_tech, 1),
        'communication_score': round(avg_comm, 1),
        'problem_solving_score': round(ps_score, 1),
        'answer_relevance_score': round(avg_relevance, 1),
        'confidence_score': round(confidence_score, 1),
        'overall_score': round(overall, 1),
        'strengths': strengths,
        'improvements': improvements,
        'evaluation_summary': summary,
    }
