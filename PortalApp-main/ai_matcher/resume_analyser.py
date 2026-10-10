import os
import json
import time
import tempfile
import shutil
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel, Field
from pypdf import PdfReader
from docx import Document

load_dotenv(Path(__file__).parent / ".env")

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is not set in .env")

client = Groq(api_key=api_key)

model = "openai/gpt-oss-120b"


class JobD(BaseModel):
    Role: str | None = None
    Required_Skills: list[str] = Field(default_factory=list)
    Preferred_Skills: list[str] = Field(default_factory=list)
    minimum_experience: float | None = None
    Education_skills: list[str] = Field(default_factory=list)
    Responsibilities: list[str] = Field(default_factory=list)


class Experience(BaseModel):
    Role: str | None = None
    Duration: str | None = None
    Description: str | None = None
    Skills_used: list[str] = Field(default_factory=list)


class Resume(BaseModel):
    Name: str | None = None
    Email: str | None = None
    Phone: str | None = None
    total_experience_years: float | None = None
    skills: list[str] = Field(default_factory=list)
    Experiences: list[Experience] = Field(default_factory=list)
    Projects: list[str] = Field(default_factory=list)


class MatchResult(BaseModel):
    score: float
    details: dict


jobd_schema = JobD.model_json_schema()
resume_schema = Resume.model_json_schema()


def job_description_parser(job_description):

    system_prompt = f"""
You are an expert HR job description analyser.

Extract structured information from the job description.

Return ONLY valid JSON matching this schema:

{jobd_schema}

Rules:

1. Extract actual technical skills, programming languages, frameworks, databases, tools and technologies.
2. Extract important job responsibilities.
3. Separate required skills from preferred skills.
4. Extract minimum experience only when explicitly mentioned.
5. Extract education requirements only when mentioned.
6. Do not invent requirements.
7. Do not classify generic words such as looking, required, years, team, lead or engineering as skills.
8. If information is unavailable, return null or [].
"""

    user_prompt = f"""
Analyze this job description:

{job_description}
"""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        response_format={
            "type": "json_object"
        }
    )

    data = json.loads(
        response.choices[0].message.content
    )

    return JobD(**data)


def parse_resume(resume_text):

    system_prompt = f"""
You are an expert resume parser.

Extract information from the resume based on its meaning.

Return ONLY valid JSON matching this schema:

{resume_schema}

Rules:

1. Do not invent information.
2. Extract technical skills from the entire resume.
3. Include internships inside Experiences.
4. Extract projects.
5. Extract work experience when present.
6. If information is unavailable, return null or [].
7. Only extract information actually present in the resume.
"""

    user_prompt = f"""
Parse the following resume:

{resume_text}
"""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        response_format={
            "type": "json_object"
        }
    )

    data = json.loads(
        response.choices[0].message.content
    )

    return Resume(**data)


def final_score(job, resume):

    prompt = f"""
You are an expert ATS resume matching engine.

Compare the candidate's resume against the job description.

JOB DESCRIPTION:

{job.model_dump_json(indent=2)}

CANDIDATE RESUME:

{resume.model_dump_json(indent=2)}

Evaluate the candidate based on:

1. Required technical skills
2. Preferred skills
3. Relevant experience
4. Experience duration
5. Projects
6. Education requirements
7. Responsibilities and domain alignment

Return ONLY valid JSON in exactly this structure:

{{
    "score": 0,
    "details": {{
        "candidate_name": "",
        "matching_skills": [],
        "missing_important_skills": [],
        "experience_requirement_met": "",
        "overall_match_percentage": 0,
        "verdict": "",
        "feedback_summary": "",
        "recommendations": []
    }}
}}

Rules:

1. score must be between 0 and 100.
2. overall_match_percentage must be between 0 and 100.
3. Match equivalent technologies when they are genuinely equivalent, but do not invent skills.
4. Give more importance to required skills than preferred skills.
5. Give more importance to relevant experience than unrelated experience.
6. Consider projects when the candidate has limited professional experience.
7. Do not penalize a candidate for information that is not required by the job description.
8. Only list genuine technical/domain skills in matching_skills and missing_important_skills.
9. Do not use generic words such as senior, manager, lead, engineering, years or team as skills.
10. A very strong candidate should receive a score close to 100 only when the resume genuinely satisfies nearly all important requirements.
11. A candidate with major missing required skills must receive a substantially lower score.
12. Keep the verdict concise and factual.
13. feedback_summary should briefly explain the candidate's overall match with the job.
14. recommendations must contain 3 to 5 specific and useful suggestions based on the missing skills or weaknesses.
"""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={
            "type": "json_object"
        }
    )

    data = json.loads(
        response.choices[0].message.content
    )

    score = data.get("score")

    if not isinstance(score, (int, float)):
        score = data.get(
            "details",
            {}
        ).get(
            "overall_match_percentage",
            0
        )

    score = max(0, min(100, float(score)))

    return MatchResult(
        score=score,
        details=data.get("details", data)
    )


def file_reader(file_path):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


def read_docx(file_path):

    document = Document(file_path)

    text = ""

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text += paragraph.text + "\n"

    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    text += cell.text + "\n"

    return text


def read_resume(file_path):

    ext = file_path.suffix.lower()

    if ext == ".pdf":
        return file_reader(file_path)

    if ext == ".docx":
        return read_docx(file_path)

    return None


def readAndRankResumes(resumes, job_data):

    all_results = []

    for resume in resumes:

        filename = getattr(
            resume,
            "filename",
            "resume.pdf"
        )

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=Path(filename).suffix
        ) as temp:

            shutil.copyfileobj(
                resume.file,
                temp
            )

            temp_path = Path(temp.name)

        try:

            resume_text = read_resume(temp_path)

            if not resume_text or not resume_text.strip():
                continue

            parsed_resume = parse_resume(
                resume_text
            )

            time.sleep(1)

            result = final_score(
                job_data,
                parsed_resume
            )

            time.sleep(1)

            all_results.append({
                "name": parsed_resume.Name or filename,
                "filename": filename,
                "score": result.score,
                "details": result.details
            })

        finally:

            if temp_path.exists():

                try:
                    os.unlink(temp_path)

                except Exception:
                    pass

    all_results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return {
        "total_candidates": len(all_results),
        "ranked_candidates": all_results,
        "top_2": all_results[:2],
        "worst_2": all_results[-2:] if all_results else []
    }


def analyze_uploaded_resume(
    file_path,
    job_description
):

    job = job_description_parser(
        job_description
    )

    resume_text = read_resume(
        Path(file_path)
    )

    if not resume_text:
        raise ValueError(
            "Could not extract resume text"
        )

    resume = parse_resume(
        resume_text
    )

    return final_score(
        job,
        resume
    )