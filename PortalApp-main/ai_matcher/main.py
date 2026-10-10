from fastapi import FastAPI, UploadFile, File, Form
import tempfile
import os

from resume_analyser import (
    job_description_parser,
    readAndRankResumes,
    analyze_uploaded_resume
)

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "Nexus AI Resume Matcher is running"
    }


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):

    suffix = os.path.splitext(
        resume.filename
    )[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:

        content = await resume.read()
        temp.write(content)
        temp_path = temp.name

    try:

        result = analyze_uploaded_resume(
            temp_path,
            job_description
        )

        return result.model_dump()

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/rank")
async def rank_resumes(
    resumes: list[UploadFile] = File(...),
    job_description: str = Form(...)
):

    job_data = job_description_parser(
        job_description
    )

    result = readAndRankResumes(
        resumes,
        job_data
    )

    return result