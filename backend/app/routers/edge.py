from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import uuid

from app.database import get_db
from app.models import EdgePlan
from app.config import settings

router = APIRouter(prefix="/api/edge", tags=["edge"])


class EdgePlanCreate(BaseModel):
    name: str
    subtitle: Optional[str] = None
    plan_type: Optional[str] = None
    is_active: bool = True
    is_preset: bool = False
    color: str = "#ef4444"
    max_trades_per_day: Optional[int] = None
    max_daily_loss: Optional[float] = None
    max_daily_profit: Optional[float] = None
    risk_per_trade: Optional[float] = None
    trading_window_start: Optional[str] = None
    trading_window_end: Optional[str] = None
    trading_window_tz: str = "UTC"
    charting_process: Optional[list] = []
    entry_criteria: Optional[list] = []
    entry_model_screenshots: Optional[list] = []
    trade_management_rules: Optional[str] = None
    exit_criteria: Optional[str] = None
    trading_notes: Optional[list] = []


class EdgePlanUpdate(BaseModel):
    name: Optional[str] = None
    subtitle: Optional[str] = None
    plan_type: Optional[str] = None
    is_active: Optional[bool] = None
    is_preset: Optional[bool] = None
    color: Optional[str] = None
    trades_taken: Optional[int] = None
    win_rate: Optional[float] = None
    net_pnl: Optional[float] = None
    compliance: Optional[float] = None
    max_trades_per_day: Optional[int] = None
    max_daily_loss: Optional[float] = None
    max_daily_profit: Optional[float] = None
    risk_per_trade: Optional[float] = None
    trading_window_start: Optional[str] = None
    trading_window_end: Optional[str] = None
    trading_window_tz: Optional[str] = None
    charting_process: Optional[list] = None
    entry_criteria: Optional[list] = None
    entry_model_screenshots: Optional[list] = None
    trade_management_rules: Optional[str] = None
    exit_criteria: Optional[str] = None
    trading_notes: Optional[list] = None
    last_reviewed: Optional[datetime] = None


@router.get("")
def get_edge_plans(db: Session = Depends(get_db)):
    plans = db.query(EdgePlan).order_by(EdgePlan.sort_order, EdgePlan.created_at).all()
    return [_plan_to_dict(p) for p in plans]


@router.get("/{plan_id}")
def get_edge_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(EdgePlan).filter(EdgePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return _plan_to_dict(plan)


@router.post("", status_code=201)
def create_edge_plan(data: EdgePlanCreate, db: Session = Depends(get_db)):
    plan = EdgePlan(**data.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return _plan_to_dict(plan)


@router.put("/{plan_id}")
def update_edge_plan(plan_id: int, data: EdgePlanUpdate, db: Session = Depends(get_db)):
    plan = db.query(EdgePlan).filter(EdgePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(plan, key, value)
    db.commit()
    db.refresh(plan)
    return _plan_to_dict(plan)


@router.post("/{plan_id}/review")
def mark_reviewed(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(EdgePlan).filter(EdgePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan.last_reviewed = datetime.utcnow()
    db.commit()
    db.refresh(plan)
    return _plan_to_dict(plan)


@router.post("/{plan_id}/screenshot")
async def upload_plan_screenshot(
    plan_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    plan = db.query(EdgePlan).filter(EdgePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".png"
    filename = f"edge_{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    screenshots = plan.entry_model_screenshots or []
    screenshots.append({"filename": filename, "label": file.filename})
    plan.entry_model_screenshots = screenshots
    db.commit()
    db.refresh(plan)
    return {"filename": filename}


@router.delete("/{plan_id}", status_code=204)
def delete_edge_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(EdgePlan).filter(EdgePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()


def _plan_to_dict(plan):
    return {
        "id": plan.id,
        "name": plan.name,
        "subtitle": plan.subtitle,
        "plan_type": plan.plan_type,
        "is_active": plan.is_active,
        "is_preset": plan.is_preset,
        "color": plan.color,
        "trades_taken": plan.trades_taken,
        "win_rate": plan.win_rate,
        "net_pnl": plan.net_pnl,
        "compliance": plan.compliance,
        "max_trades_per_day": plan.max_trades_per_day,
        "max_daily_loss": plan.max_daily_loss,
        "max_daily_profit": plan.max_daily_profit,
        "risk_per_trade": plan.risk_per_trade,
        "trading_window_start": plan.trading_window_start,
        "trading_window_end": plan.trading_window_end,
        "trading_window_tz": plan.trading_window_tz,
        "charting_process": plan.charting_process or [],
        "entry_criteria": plan.entry_criteria or [],
        "entry_model_screenshots": plan.entry_model_screenshots or [],
        "trade_management_rules": plan.trade_management_rules,
        "exit_criteria": plan.exit_criteria,
        "trading_notes": plan.trading_notes or [],
        "last_reviewed": plan.last_reviewed.isoformat() if plan.last_reviewed else None,
        "created_at": plan.created_at.isoformat() if plan.created_at else None,
    }
