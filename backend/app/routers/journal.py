from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import JournalEntry
from app.schemas import JournalCreate, JournalUpdate, JournalResponse

router = APIRouter(prefix="/api/journal", tags=["journal"])


@router.get("", response_model=list[JournalResponse])
def get_journal_entries(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(default=50, le=500),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(JournalEntry)
    if start_date:
        query = query.filter(JournalEntry.date >= start_date)
    if end_date:
        query = query.filter(JournalEntry.date <= end_date)
    return query.order_by(desc(JournalEntry.date)).offset(offset).limit(limit).all()


@router.get("/{entry_id}", response_model=JournalResponse)
def get_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.post("", response_model=JournalResponse, status_code=201)
def create_journal_entry(entry_data: JournalCreate, db: Session = Depends(get_db)):
    entry = JournalEntry(**entry_data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=JournalResponse)
def update_journal_entry(entry_id: int, entry_data: JournalUpdate, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    for key, value in entry_data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    db.delete(entry)
    db.commit()
