from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pdfplumber
from keybert import KeyBERT
import google.generativeai as genai
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini API
genai.configure(api_key="AIzaSyAhGXl6-QjZCKh3tvKnkG0TEI-7MoIybt0")

def get_direct_pdf_url(url):
    """Convert Google Drive URL to direct download link if needed."""
    if "drive.google.com/uc?export=download&id=" in url:
        return url
    if "drive.google.com/file/d/" in url:
        file_id = url.split("/file/d/")[1].split("/")[0]
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    return url

def generate_job_description(role):
    """Generate job description using Gemini AI."""
    model = genai.GenerativeModel('gemini-2.0-flash')
    prompt = f"Generate a detailed job description for a {role}. Include required skills, experience, and responsibilities."
    response = model.generate_content(prompt)
    return response.text

def run_ats(resume_url, role):
    """Run ATS scan on a resume."""
    try:
        # Convert Google Drive link if needed
        resume_url = get_direct_pdf_url(resume_url)

        # Generate job description
        job_description = generate_job_description(role)

        # Download PDF to a temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmpfile:
            r = requests.get(resume_url, stream=True)
            for chunk in r.iter_content(1024):
                tmpfile.write(chunk)
            tmpfile_path = tmpfile.name

        # Extract text from PDF
        text = ""
        with pdfplumber.open(tmpfile_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""

        # Remove temp file
        os.remove(tmpfile_path)

        # Extract keywords
        kw_model = KeyBERT()
        job_keywords = [kw[0] for kw in kw_model.extract_keywords(job_description, top_n=20)]
        resume_keywords = [kw[0] for kw in kw_model.extract_keywords(text, top_n=40)]

        # Calculate ATS score
        matched_keywords = set(job_keywords) & set(resume_keywords)
        score = int((len(matched_keywords) / len(job_keywords)) * 100 + 40) if job_keywords else 0
        score += 20  # Add a base score

        return {"score": score, "matchedKeywords": list(matched_keywords)}

    except Exception as e:
        print(f"Error processing resume: {e}")
        return {"score": 0, "matchedKeywords": [], "error": str(e)}

@app.route('/run-ats', methods=['POST', 'OPTIONS'])
def ats_scan():
    """Endpoint to run ATS scan on multiple candidates."""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    data = request.json
    candidates = data.get('candidates', [])

    results = []
    for candidate in candidates:
        try:
            ats_result = run_ats(candidate['resumeUrl'], candidate['role'])
            results.append({
                "id": candidate.get("id"),
                "score": ats_result["score"],
                "matchedKeywords": ats_result["matchedKeywords"]
            })
        except Exception as e:
            results.append({
                "id": candidate.get("id"),
                "score": 0,
                "matchedKeywords": [],
                "error": str(e)
            })

    return jsonify({"results": results})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
