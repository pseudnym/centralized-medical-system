import requests
import xml.etree.ElementTree as ET
import html
import re

MEDLINE_URL = "https://wsearch.nlm.nih.gov/ws/query"

def fetch_medline_summary(term: str, max_results: int = 3) -> str:
    """
    Fetch health topic summaries from MedlinePlus and return cleaned plain text.
    """
    params = {"db": "healthTopics", "term": term, "retmax": max_results}

    try:
        r = requests.get(MEDLINE_URL, params=params, timeout=10)
        r.raise_for_status()
    except requests.RequestException as e:
        return f"MedlinePlus request failed: {e}"

    try:
        root = ET.fromstring(r.content)
    except ET.ParseError:
        return "Failed to parse MedlinePlus response."

    summaries = []
    for doc in root.findall(".//document"):
        title = ""
        summary = ""

        for content in doc.findall("content"):
            name = content.attrib.get("name")
            if name == "title":
                title = content.text or ""
            elif name == "FullSummary":
                summary = content.text or ""

        if summary:
            clean_summary = html.unescape(summary)
            # Remove HTML tags
            clean_summary = re.sub(r"<.*?>", "", clean_summary)
            # Replace multiple newlines or spaces
            clean_summary = re.sub(r"\s+\n", "\n", clean_summary)
            clean_summary = re.sub(r"\n\s+", "\n", clean_summary)
            clean_summary = clean_summary.strip()
            summaries.append(f"{title}:\n{clean_summary}")

    return "\n\n".join(summaries) if summaries else "No MedlinePlus data found."
