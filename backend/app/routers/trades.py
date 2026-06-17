from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime
import os
import uuid

from app.database import get_db
from app.models import Trade, TradeScreenshot
from app.schemas import TradeCreate, TradeUpdate, TradeResponse
from app.config import settings

router = APIRouter(prefix="/api/trades", tags=["trades"])


@router.get("", response_model=list[TradeResponse])
def get_trades(
    status: Optional[str] = None,
    symbol: Optional[str] = None,
    strategy: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(default=50, le=500),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(Trade)
    if status:
        query = query.filter(Trade.status == status)
    if symbol:
        query = query.filter(Trade.symbol == symbol)
    if strategy:
        query = query.filter(Trade.strategy == strategy)
    if start_date:
        query = query.filter(Trade.open_time >= start_date)
    if end_date:
        query = query.filter(Trade.open_time <= end_date)
    return query.order_by(desc(Trade.open_time)).offset(offset).limit(limit).all()


@router.get("/{trade_id}", response_model=TradeResponse)
def get_trade(trade_id: int, db: Session = Depends(get_db)):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade


@router.post("", response_model=TradeResponse, status_code=201)
def create_trade(trade_data: TradeCreate, db: Session = Depends(get_db)):
    if trade_data.ticket:
        existing = db.query(Trade).filter(Trade.ticket == trade_data.ticket).first()
        if existing:
            raise HTTPException(status_code=409, detail="Trade with this ticket already exists")
    trade = Trade(**trade_data.model_dump())
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade


@router.put("/{trade_id}", response_model=TradeResponse)
def update_trade(trade_id: int, trade_data: TradeUpdate, db: Session = Depends(get_db)):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    for key, value in trade_data.model_dump(exclude_unset=True).items():
        setattr(trade, key, value)
    db.commit()
    db.refresh(trade)
    return trade


@router.delete("/{trade_id}", status_code=204)
def delete_trade(trade_id: int, db: Session = Depends(get_db)):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    db.delete(trade)
    db.commit()


@router.post("/{trade_id}/screenshots")
async def upload_screenshot(
    trade_id: int,
    file: UploadFile = File(...),
    label: Optional[str] = None,
    db: Session = Depends(get_db),
):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".png"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    with open(filepath, "wb") as f:
        f.write(content)

    screenshot = TradeScreenshot(trade_id=trade_id, filename=filename, label=label)
    db.add(screenshot)
    db.commit()
    db.refresh(screenshot)
    return {"id": screenshot.id, "filename": filename, "label": label}


@router.get("/stats/symbols")
def get_symbols(db: Session = Depends(get_db)):
    symbols = db.query(Trade.symbol).distinct().all()
    return [s[0] for s in symbols]


@router.get("/stats/strategies")
def get_strategies(db: Session = Depends(get_db)):
    strategies = db.query(Trade.strategy).filter(Trade.strategy.isnot(None)).distinct().all()
    return [s[0] for s in strategies]
