from fastapi import APIRouter
from typing import Optional
import xml.etree.ElementTree as ET
import urllib.request
from datetime import datetime
import re

router = APIRouter(prefix="/api/news", tags=["news"])

CACHE = {"data": None, "fetched_at": None}


def parse_ff_date(date_str):
    try:
        dt = datetime.strptime(date_str.strip(), "%m-%d-%Y")
        return dt.strftime("%A, %B %d, %Y")
    except Exception:
        return date_str


def convert_to_24h(time_str):
    if not time_str or time_str.strip() == "":
        return ""
    time_str = time_str.strip()
    if time_str.lower() in ("all day", "tentative", ""):
        return time_str
    try:
        dt = datetime.strptime(time_str, "%I:%M%p")
        return dt.strftime("%H:%M")
    except Exception:
        return time_str


def fetch_forex_factory():
    now = datetime.utcnow()
    if CACHE["data"] and CACHE["fetched_at"] and (now - CACHE["fetched_at"]).seconds < 1800:
        return CACHE["data"]

    events = []
    urls = [
        "https://nfs.faireconomy.media/ff_calendar_thisweek.xml",
    ]

    for url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (TradeDash)"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                xml_data = resp.read().decode("utf-8", errors="replace")

            root = ET.fromstring(xml_data)
            for event in root.findall(".//event"):
                title = (event.findtext("title") or "").strip()
                country = (event.findtext("country") or "").strip().upper()
                date_str = (event.findtext("date") or "").strip()
                time_str = (event.findtext("time") or "").strip()
                impact = (event.findtext("impact") or "").strip()
                forecast = (event.findtext("forecast") or "").strip()
                previous = (event.findtext("previous") or "").strip()
                actual = (event.findtext("actual") or "").strip()

                if not title:
                    continue

                events.append({
                    "title": title,
                    "country": country,
                    "date": parse_ff_date(date_str),
                    "time": convert_to_24h(time_str),
                    "impact": impact,
                    "forecast": forecast,
                    "previous": previous,
                    "actual": actual,
                })
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            continue

    if events:
        CACHE["data"] = events
        CACHE["fetched_at"] = now
    elif CACHE["data"]:
        return CACHE["data"]

    return events


@router.get("")
def get_news(
    currency: Optional[str] = None,
    impact: Optional[str] = None,
):
    events = fetch_forex_factory()

    if currency:
        currencies = [c.strip().upper() for c in currency.split(",")]
        events = [e for e in events if e["country"] in currencies]

    if impact:
        impacts = [i.strip().capitalize() for i in impact.split(",")]
        events = [e for e in events if e["impact"] in impacts]

    grouped = {}
    for e in events:
        date_key = e["date"]
        if date_key not in grouped:
            grouped[date_key] = []
        grouped[date_key].append(e)

    return {"events": events, "grouped": grouped, "total": len(events)}
