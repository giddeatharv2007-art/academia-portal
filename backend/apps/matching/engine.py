"""
Skill Matching Engine - Algorithmic (LLM-fallback ready)

This engine computes:
1. Student ↔ Job/Internship match score
2. Skill gap analysis
3. Student ranking (priority-based)
4. Reverse mapping: Company → Top Students
"""
from typing import List, Dict, Optional, Tuple


def calculate_skill_match(
    student_skills: List[Dict],
    required_skills: List[str],
    preferred_skills: Optional[List[str]] = None,
) -> Dict:
    """
    Calculate match score between student skills and job/internship requirements.

    Args:
        student_skills: [{'name': 'Python', 'proficiency': 80, 'is_verified': True}, ...]
        required_skills: ['Python', 'Django', 'SQL']
        preferred_skills: ['Docker', 'AWS']

    Returns:
        {
          'match_score': 78.5,
          'matched_skills': [...],
          'missing_skills': [...],
          'explanation': '...',
          'breakdown': {...}
        }
    """
    if not required_skills:
        return {
            'match_score': 100.0,
            'matched_skills': [],
            'missing_skills': [],
            'explanation': 'No specific skills required.',
            'breakdown': {}
        }

    student_skill_map = {
        s['name'].lower(): s for s in student_skills
    }

    matched = []
    missing = []

    for req_skill in required_skills:
        found = student_skill_map.get(req_skill.lower())
        if found:
            matched.append({
                'name': req_skill,
                'proficiency': found['proficiency'],
                'is_verified': found.get('is_verified', False),
            })
        else:
            missing.append({'name': req_skill})

    # Base score: required skill coverage
    required_score = (len(matched) / len(required_skills)) * 100 if required_skills else 100

    # Bonus: proficiency weight
    proficiency_bonus = 0
    if matched:
        avg_proficiency = sum(s['proficiency'] for s in matched) / len(matched)
        proficiency_bonus = (avg_proficiency - 50) * 0.1  # max ±5 bonus

    # Bonus: verified skills
    verified_count = sum(1 for s in matched if s.get('is_verified'))
    verified_bonus = (verified_count / max(len(matched), 1)) * 5

    # Preferred skills bonus
    preferred_matched = []
    preferred_bonus = 0
    if preferred_skills:
        for pref in preferred_skills:
            if pref.lower() in student_skill_map:
                preferred_matched.append(pref)
        preferred_bonus = (len(preferred_matched) / len(preferred_skills)) * 5

    final_score = min(100, required_score + proficiency_bonus + verified_bonus + preferred_bonus)
    final_score = round(final_score, 1)

    # Build explanation
    explanation = _build_explanation(
        final_score, matched, missing, required_skills,
        verified_count, proficiency_bonus
    )

    return {
        'match_score': final_score,
        'matched_skills': matched,
        'missing_skills': missing,
        'preferred_matched': preferred_matched,
        'explanation': explanation,
        'breakdown': {
            'required_coverage': round(required_score, 1),
            'proficiency_bonus': round(proficiency_bonus, 1),
            'verified_bonus': round(verified_bonus, 1),
            'preferred_bonus': round(preferred_bonus, 1),
            'matched_count': len(matched),
            'required_count': len(required_skills),
            'missing_count': len(missing),
        }
    }


def _build_explanation(score, matched, missing, required, verified_count, proficiency_bonus):
    """Generate a human-readable explanation of the match score."""
    parts = []
    parts.append(
        f"Your match score is {score}% because you have "
        f"{len(matched)} of {len(required)} required skills."
    )
    if missing:
        missing_names = ', '.join(s['name'] for s in missing)
        parts.append(f"Missing required skills: {missing_names}.")
    if verified_count > 0:
        parts.append(f"{verified_count} of your matched skills are verified, which adds credibility.")
    if proficiency_bonus > 2:
        parts.append("Your above-average proficiency in matched skills provides a small boost.")
    if score >= 90:
        parts.append("Excellent match! You meet almost all requirements.")
    elif score >= 75:
        parts.append("Good match. Consider learning the missing skills to improve your chances.")
    elif score >= 50:
        parts.append("Moderate match. Focus on the missing skills before applying.")
    else:
        parts.append("Low match. Significant skill development needed for this role.")
    return ' '.join(parts)


def calculate_skill_gap(student_skills: List[Dict], target_role: str) -> Dict:
    """
    Calculate skill gap for a target role.

    Returns current readiness, potential readiness, missing skills, and roadmap.
    """
    ROLE_SKILLS = {
        'backend developer': {
            'required': ['Python', 'Django', 'SQL', 'REST API', 'Git'],
            'intermediate': ['Docker', 'PostgreSQL', 'Redis'],
            'advanced': ['AWS', 'CI/CD', 'Microservices', 'Kubernetes'],
        },
        'frontend developer': {
            'required': ['HTML', 'CSS', 'JavaScript', 'React'],
            'intermediate': ['TypeScript', 'Tailwind CSS', 'Git'],
            'advanced': ['Next.js', 'Testing', 'Performance Optimization'],
        },
        'full stack developer': {
            'required': ['Python', 'JavaScript', 'React', 'Django', 'SQL'],
            'intermediate': ['REST API', 'Git', 'Docker'],
            'advanced': ['AWS', 'CI/CD', 'TypeScript', 'Redis'],
        },
        'data scientist': {
            'required': ['Python', 'SQL', 'Machine Learning', 'Statistics'],
            'intermediate': ['Pandas', 'NumPy', 'Scikit-learn', 'Data Visualization'],
            'advanced': ['Deep Learning', 'TensorFlow', 'PyTorch', 'Big Data'],
        },
        'ai/ml engineer': {
            'required': ['Python', 'Machine Learning', 'Deep Learning', 'Mathematics'],
            'intermediate': ['TensorFlow', 'PyTorch', 'SQL', 'Computer Vision'],
            'advanced': ['MLOps', 'Cloud AI', 'NLP', 'Reinforcement Learning'],
        },
        'data analyst': {
            'required': ['SQL', 'Excel', 'Python', 'Data Visualization'],
            'intermediate': ['Tableau', 'Power BI', 'Statistics', 'Pandas'],
            'advanced': ['R', 'Machine Learning', 'Big Data', 'ETL'],
        },
        'devops engineer': {
            'required': ['Linux', 'Docker', 'CI/CD', 'Git'],
            'intermediate': ['Kubernetes', 'AWS', 'Terraform', 'Ansible'],
            'advanced': ['Security', 'Monitoring', 'Microservices', 'SRE'],
        },
        'mobile developer': {
            'required': ['Java', 'Kotlin', 'Android', 'APIs'],
            'intermediate': ['React Native', 'Flutter', 'Firebase', 'Git'],
            'advanced': ['iOS', 'Swift', 'Performance', 'Testing'],
        },
        'cybersecurity': {
            'required': ['Networking', 'Linux', 'Security Fundamentals', 'Python'],
            'intermediate': ['Penetration Testing', 'OWASP', 'Cryptography'],
            'advanced': ['Forensics', 'Malware Analysis', 'Cloud Security'],
        },
    }

    role_key = target_role.lower().strip()
    # Fuzzy match role
    role_data = None
    for key, data in ROLE_SKILLS.items():
        if key in role_key or role_key in key:
            role_data = data
            break

    if not role_data:
        # Default generic skills
        role_data = {
            'required': ['Communication', 'Problem Solving', 'Git', 'Linux'],
            'intermediate': ['Python', 'SQL', 'APIs'],
            'advanced': ['Cloud', 'DevOps', 'Testing'],
        }

    student_skill_names = {s['name'].lower() for s in student_skills}

    all_skills = role_data['required'] + role_data['intermediate'] + role_data['advanced']
    has_skills = [s for s in all_skills if s.lower() in student_skill_names]
    missing_required = [s for s in role_data['required'] if s.lower() not in student_skill_names]
    missing_intermediate = [s for s in role_data['intermediate'] if s.lower() not in student_skill_names]
    missing_advanced = [s for s in role_data['advanced'] if s.lower() not in student_skill_names]

    # Current readiness = weighted coverage
    req_weight, int_weight, adv_weight = 0.5, 0.3, 0.2
    req_covered = len(role_data['required']) - len(missing_required)
    int_covered = len(role_data['intermediate']) - len(missing_intermediate)
    adv_covered = len(role_data['advanced']) - len(missing_advanced)

    current_readiness = (
        (req_covered / max(len(role_data['required']), 1)) * req_weight +
        (int_covered / max(len(role_data['intermediate']), 1)) * int_weight +
        (adv_covered / max(len(role_data['advanced']), 1)) * adv_weight
    ) * 100

    # Potential readiness if all missing required skills are learned
    potential_readiness = current_readiness + (
        (len(missing_required) / max(len(role_data['required']), 1)) * req_weight * 100
    )
    potential_readiness = min(potential_readiness, 95)  # cap at 95

    return {
        'target_role': target_role,
        'current_readiness': round(current_readiness, 1),
        'potential_readiness': round(potential_readiness, 1),
        'has_skills': has_skills,
        'missing_required': missing_required,
        'missing_intermediate': missing_intermediate,
        'missing_advanced': missing_advanced,
        'total_role_skills': len(all_skills),
        'covered_count': len(has_skills),
    }


def generate_learning_roadmap(missing_skills: List[str], target_role: str) -> List[Dict]:
    """
    Generate ordered learning roadmap for missing skills.
    """
    RESOURCES = {
        'python': {'url': 'https://docs.python.org/3/tutorial/', 'provider': 'Python.org', 'hours': 30},
        'django': {'url': 'https://docs.djangoproject.com/en/stable/intro/tutorial01/', 'provider': 'Django', 'hours': 20},
        'react': {'url': 'https://react.dev/learn', 'provider': 'React.dev', 'hours': 25},
        'sql': {'url': 'https://www.w3schools.com/sql/', 'provider': 'W3Schools', 'hours': 15},
        'docker': {'url': 'https://docs.docker.com/get-started/', 'provider': 'Docker', 'hours': 12},
        'aws': {'url': 'https://aws.amazon.com/training/digital/', 'provider': 'AWS', 'hours': 40},
        'git': {'url': 'https://git-scm.com/doc', 'provider': 'Git', 'hours': 8},
        'machine learning': {'url': 'https://www.coursera.org/learn/machine-learning', 'provider': 'Coursera', 'hours': 60},
        'rest api': {'url': 'https://www.restapitutorial.com/', 'provider': 'RestApiTutorial', 'hours': 10},
        'javascript': {'url': 'https://javascript.info/', 'provider': 'javascript.info', 'hours': 30},
        'postgresql': {'url': 'https://www.postgresql.org/docs/current/tutorial.html', 'provider': 'PostgreSQL', 'hours': 15},
        'ci/cd': {'url': 'https://docs.github.com/en/actions', 'provider': 'GitHub Actions', 'hours': 15},
        'kubernetes': {'url': 'https://kubernetes.io/docs/tutorials/', 'provider': 'Kubernetes', 'hours': 25},
        'tensorflow': {'url': 'https://www.tensorflow.org/tutorials', 'provider': 'TensorFlow', 'hours': 35},
        'typescript': {'url': 'https://www.typescriptlang.org/docs/', 'provider': 'TypeScript', 'hours': 20},
    }

    roadmap = []
    for i, skill in enumerate(missing_skills):
        resource_key = skill.lower()
        resource = RESOURCES.get(resource_key, {
            'url': f'https://www.google.com/search?q={skill}+tutorial',
            'provider': 'Various',
            'hours': 15
        })

        difficulty = 'beginner' if i < 2 else ('intermediate' if i < 5 else 'advanced')

        roadmap.append({
            'order': i + 1,
            'skill': skill,
            'difficulty': difficulty,
            'estimated_hours': resource['hours'],
            'recommended_resource': resource['provider'],
            'resource_url': resource['url'],
            'status': 'not_started',
            'is_required': True,
        })

    return roadmap


# ─────────────────────────────────────────────────────────────────────────────
# Suggested Certifications
# ─────────────────────────────────────────────────────────────────────────────

# Skill → certification mapping (one or two top certs per skill/area)
_SKILL_CERTS: Dict[str, List[Dict]] = {
    'python': [
        {'name': 'PCEP – Certified Entry-Level Python Programmer', 'provider': 'Python Institute',
         'url': 'https://pythoninstitute.org/pcep', 'level': 'Beginner', 'free': False},
        {'name': 'Google IT Automation with Python', 'provider': 'Google / Coursera',
         'url': 'https://www.coursera.org/professional-certificates/google-it-automation', 'level': 'Beginner', 'free': False},
    ],
    'django': [
        {'name': 'Django Developer Certificate', 'provider': 'JetBrains Academy',
         'url': 'https://www.jetbrains.com/academy/', 'level': 'Intermediate', 'free': False},
    ],
    'javascript': [
        {'name': 'JavaScript Algorithms and Data Structures', 'provider': 'freeCodeCamp',
         'url': 'https://www.freecodecamp.org/certification/', 'level': 'Beginner', 'free': True},
    ],
    'react': [
        {'name': 'Meta Front-End Developer Certificate', 'provider': 'Meta / Coursera',
         'url': 'https://www.coursera.org/professional-certificates/meta-front-end-developer', 'level': 'Intermediate', 'free': False},
    ],
    'typescript': [
        {'name': 'TypeScript Fundamentals – W3Schools', 'provider': 'W3Schools',
         'url': 'https://courses.w3schools.com/courses/typescript', 'level': 'Beginner', 'free': False},
    ],
    'sql': [
        {'name': 'SQL for Data Science (UC Davis)', 'provider': 'Coursera',
         'url': 'https://www.coursera.org/learn/sql-for-data-science', 'level': 'Beginner', 'free': False},
    ],
    'postgresql': [
        {'name': 'EDB PostgreSQL 12 Associate Certification', 'provider': 'EnterpriseDB',
         'url': 'https://www.enterprisedb.com/training/postgres-certification', 'level': 'Intermediate', 'free': False},
    ],
    'docker': [
        {'name': 'Docker Certified Associate (DCA)', 'provider': 'Docker',
         'url': 'https://training.mirantis.com/certification/dca-certification-exam/', 'level': 'Intermediate', 'free': False},
    ],
    'kubernetes': [
        {'name': 'Certified Kubernetes Administrator (CKA)', 'provider': 'CNCF / Linux Foundation',
         'url': 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/', 'level': 'Advanced', 'free': False},
        {'name': 'Certified Kubernetes Application Developer (CKAD)', 'provider': 'CNCF / Linux Foundation',
         'url': 'https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad-2/', 'level': 'Intermediate', 'free': False},
    ],
    'aws': [
        {'name': 'AWS Certified Cloud Practitioner (CLF-C02)', 'provider': 'Amazon Web Services',
         'url': 'https://aws.amazon.com/certification/certified-cloud-practitioner/', 'level': 'Beginner', 'free': False},
        {'name': 'AWS Certified Solutions Architect – Associate', 'provider': 'Amazon Web Services',
         'url': 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', 'level': 'Intermediate', 'free': False},
    ],
    'ci/cd': [
        {'name': 'GitHub Actions Certification', 'provider': 'GitHub',
         'url': 'https://resources.github.com/learn/certifications/', 'level': 'Intermediate', 'free': False},
    ],
    'git': [
        {'name': 'GitHub Foundations Certification', 'provider': 'GitHub',
         'url': 'https://resources.github.com/learn/certifications/', 'level': 'Beginner', 'free': False},
    ],
    'machine learning': [
        {'name': 'DeepLearning.AI Machine Learning Specialization', 'provider': 'DeepLearning.AI / Coursera',
         'url': 'https://www.coursera.org/specializations/machine-learning-introduction', 'level': 'Intermediate', 'free': False},
    ],
    'deep learning': [
        {'name': 'Deep Learning Specialization', 'provider': 'DeepLearning.AI / Coursera',
         'url': 'https://www.coursera.org/specializations/deep-learning', 'level': 'Advanced', 'free': False},
    ],
    'tensorflow': [
        {'name': 'TensorFlow Developer Certificate', 'provider': 'Google',
         'url': 'https://www.tensorflow.org/certificate', 'level': 'Intermediate', 'free': False},
    ],
    'data visualization': [
        {'name': 'Tableau Desktop Specialist', 'provider': 'Tableau',
         'url': 'https://www.tableau.com/learn/certification/desktop-specialist', 'level': 'Beginner', 'free': False},
    ],
    'linux': [
        {'name': 'Linux Foundation Certified IT Associate (LFCA)', 'provider': 'Linux Foundation',
         'url': 'https://training.linuxfoundation.org/certification/certified-it-associate/', 'level': 'Beginner', 'free': False},
    ],
    'terraform': [
        {'name': 'HashiCorp Certified: Terraform Associate', 'provider': 'HashiCorp',
         'url': 'https://www.hashicorp.com/certifications/terraform-associate', 'level': 'Intermediate', 'free': False},
    ],
    'security fundamentals': [
        {'name': 'CompTIA Security+', 'provider': 'CompTIA',
         'url': 'https://www.comptia.org/certifications/security', 'level': 'Beginner', 'free': False},
    ],
    'networking': [
        {'name': 'CompTIA Network+', 'provider': 'CompTIA',
         'url': 'https://www.comptia.org/certifications/network', 'level': 'Beginner', 'free': False},
        {'name': 'Cisco CCNA', 'provider': 'Cisco',
         'url': 'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html', 'level': 'Intermediate', 'free': False},
    ],
    'rest api': [
        {'name': 'API Designer – Postman Student Expert', 'provider': 'Postman',
         'url': 'https://academy.postman.com/', 'level': 'Beginner', 'free': True},
    ],
    'cloud ai': [
        {'name': 'Google Professional Machine Learning Engineer', 'provider': 'Google Cloud',
         'url': 'https://cloud.google.com/certification/machine-learning-engineer', 'level': 'Advanced', 'free': False},
    ],
}

# Role-level certifications that are always relevant regardless of specific missing skills
_ROLE_CERTS: Dict[str, List[Dict]] = {
    'backend developer': [
        {'name': 'AWS Certified Developer – Associate', 'provider': 'Amazon Web Services',
         'url': 'https://aws.amazon.com/certification/certified-developer-associate/', 'level': 'Intermediate', 'free': False},
    ],
    'frontend developer': [
        {'name': 'Meta Front-End Developer Certificate', 'provider': 'Meta / Coursera',
         'url': 'https://www.coursera.org/professional-certificates/meta-front-end-developer', 'level': 'Intermediate', 'free': False},
    ],
    'full stack developer': [
        {'name': 'IBM Full Stack Software Developer', 'provider': 'IBM / Coursera',
         'url': 'https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer', 'level': 'Intermediate', 'free': False},
    ],
    'data scientist': [
        {'name': 'IBM Data Science Professional Certificate', 'provider': 'IBM / Coursera',
         'url': 'https://www.coursera.org/professional-certificates/ibm-data-science', 'level': 'Intermediate', 'free': False},
        {'name': 'Google Advanced Data Analytics Certificate', 'provider': 'Google / Coursera',
         'url': 'https://www.coursera.org/professional-certificates/google-advanced-data-analytics', 'level': 'Intermediate', 'free': False},
    ],
    'ai/ml engineer': [
        {'name': 'TensorFlow Developer Certificate', 'provider': 'Google',
         'url': 'https://www.tensorflow.org/certificate', 'level': 'Intermediate', 'free': False},
        {'name': 'Deep Learning Specialization', 'provider': 'DeepLearning.AI / Coursera',
         'url': 'https://www.coursera.org/specializations/deep-learning', 'level': 'Advanced', 'free': False},
    ],
    'data analyst': [
        {'name': 'Google Data Analytics Certificate', 'provider': 'Google / Coursera',
         'url': 'https://www.coursera.org/professional-certificates/google-data-analytics', 'level': 'Beginner', 'free': False},
    ],
    'devops engineer': [
        {'name': 'AWS Certified DevOps Engineer – Professional', 'provider': 'Amazon Web Services',
         'url': 'https://aws.amazon.com/certification/certified-devops-engineer-professional/', 'level': 'Advanced', 'free': False},
        {'name': 'Certified Kubernetes Administrator (CKA)', 'provider': 'CNCF / Linux Foundation',
         'url': 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/', 'level': 'Advanced', 'free': False},
    ],
    'mobile developer': [
        {'name': 'Meta Android Developer Certificate', 'provider': 'Meta / Coursera',
         'url': 'https://www.coursera.org/professional-certificates/meta-android-developer', 'level': 'Intermediate', 'free': False},
    ],
    'cybersecurity': [
        {'name': 'CompTIA Security+', 'provider': 'CompTIA',
         'url': 'https://www.comptia.org/certifications/security', 'level': 'Beginner', 'free': False},
        {'name': 'Certified Ethical Hacker (CEH)', 'provider': 'EC-Council',
         'url': 'https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/', 'level': 'Intermediate', 'free': False},
    ],
}


def get_suggested_certifications(missing_skills: List[str], target_role: str) -> List[Dict]:
    """
    Return a deduplicated list of suggested certifications based on:
      1. The student's missing skills (skill-level certs)
      2. The target role (role-level certs always worth having)

    Each item: { name, provider, url, level, free, reason }
    """
    seen_names: set = set()
    results: List[Dict] = []

    def _add(cert: Dict, reason: str) -> None:
        if cert['name'] not in seen_names:
            seen_names.add(cert['name'])
            results.append({**cert, 'reason': reason})

    # 1. Skill-level certs — tied to what the student is missing
    for skill in missing_skills:
        key = skill.lower()
        for cert_key, certs in _SKILL_CERTS.items():
            if cert_key in key or key in cert_key:
                for cert in certs:
                    _add(cert, f'Validates your {skill} knowledge')

    # 2. Role-level certs — always relevant for the target role
    role_key = target_role.lower().strip()
    for key, certs in _ROLE_CERTS.items():
        if key in role_key or role_key in key:
            for cert in certs:
                _add(cert, f'Highly valued for {target_role} roles')

    return results


def rank_candidates(candidates: List[Dict]) -> List[Dict]:
    """
    Priority-based candidate ranking.

    Each candidate dict should have:
    - skill_match_score: float
    - assessment_score: float (optional)
    - has_relevant_project: bool
    - internship_experience_count: int
    - verified_certification_count: int
    - communication_score: float (optional)
    - problem_solving_score: float (optional)
    - cgpa: float (optional)
    - relevant_experience_months: int
    """
    WEIGHTS = {
        'skill_match_score': 0.30,
        'assessment_score': 0.20,
        'has_relevant_project': 0.15,
        'internship_experience_count': 0.10,
        'verified_certification_count': 0.08,
        'communication_score': 0.07,
        'problem_solving_score': 0.05,
        'cgpa': 0.03,
        'relevant_experience_months': 0.02,
    }

    def normalize(value, max_val):
        return min(float(value or 0) / max_val, 1.0) * 100

    for candidate in candidates:
        score = 0
        breakdown = {}

        # Skill match
        sm = float(candidate.get('skill_match_score', 0))
        score += sm * WEIGHTS['skill_match_score']
        breakdown['skill_match'] = round(sm * WEIGHTS['skill_match_score'], 1)

        # Assessment
        asm = float(candidate.get('assessment_score', 0))
        score += asm * WEIGHTS['assessment_score']
        breakdown['assessment'] = round(asm * WEIGHTS['assessment_score'], 1)

        # Project
        proj = 100 if candidate.get('has_relevant_project') else 0
        score += proj * WEIGHTS['has_relevant_project']
        breakdown['project'] = round(proj * WEIGHTS['has_relevant_project'], 1)

        # Internship
        intern_val = normalize(candidate.get('internship_experience_count', 0), 5)
        score += intern_val * WEIGHTS['internship_experience_count']
        breakdown['internship'] = round(intern_val * WEIGHTS['internship_experience_count'], 1)

        # Certifications
        cert_val = normalize(candidate.get('verified_certification_count', 0), 5)
        score += cert_val * WEIGHTS['verified_certification_count']
        breakdown['certifications'] = round(cert_val * WEIGHTS['verified_certification_count'], 1)

        # Communication
        comm = float(candidate.get('communication_score', 0))
        score += comm * WEIGHTS['communication_score']
        breakdown['communication'] = round(comm * WEIGHTS['communication_score'], 1)

        # Problem solving
        ps = float(candidate.get('problem_solving_score', 0))
        score += ps * WEIGHTS['problem_solving_score']
        breakdown['problem_solving'] = round(ps * WEIGHTS['problem_solving_score'], 1)

        # CGPA
        cgpa_val = normalize(candidate.get('cgpa', 0), 10)
        score += cgpa_val * WEIGHTS['cgpa']
        breakdown['cgpa'] = round(cgpa_val * WEIGHTS['cgpa'], 1)

        candidate['composite_score'] = round(score, 1)
        candidate['score_breakdown'] = breakdown

    # Sort by composite score descending
    ranked = sorted(candidates, key=lambda x: x['composite_score'], reverse=True)

    # Add rank and explanation
    for i, candidate in enumerate(ranked):
        candidate['rank'] = i + 1
        candidate['rank_explanation'] = _build_rank_explanation(candidate, ranked)

    return ranked


def _build_rank_explanation(candidate: Dict, all_candidates: List[Dict]) -> str:
    """Explain why this candidate is ranked at this position."""
    rank = candidate['rank']
    score = candidate['composite_score']
    sm = candidate.get('skill_match_score', 0)
    asm = candidate.get('assessment_score', 0)
    has_proj = candidate.get('has_relevant_project', False)

    parts = [f"Ranked #{rank} with composite score {score}/100."]

    if sm >= 90:
        parts.append("Excellent skill match.")
    elif sm >= 75:
        parts.append("Strong skill match.")

    if asm >= 80:
        parts.append("High assessment score.")

    if has_proj:
        parts.append("Has relevant project experience.")

    if rank > 1 and all_candidates:
        top = all_candidates[0]
        if top.get('skill_match_score', 0) > sm:
            parts.append(f"Ranked below #{1} due to lower skill match score.")
        elif top.get('assessment_score', 0) > asm:
            parts.append(f"Ranked below #{1} due to lower assessment score.")
        elif top.get('has_relevant_project') and not has_proj:
            parts.append("A relevant project would improve this ranking.")

    return ' '.join(parts)
