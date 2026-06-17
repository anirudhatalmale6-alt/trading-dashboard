from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TradingRule
from app.schemas import TradingRuleCreate, TradingRuleResponse

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.get("", response_model=list[TradingRuleResponse])
def get_rules(db: Session = Depends(get_db)):
    return db.query(TradingRule).all()


@router.post("", response_model=TradingRuleResponse, status_code=201)
def create_rule(data: TradingRuleCreate, db: Session = Depends(get_db)):
    rule = TradingRule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/{rule_id}", response_model=TradingRuleResponse)
def update_rule(rule_id: int, data: TradingRuleCreate, db: Session = Depends(get_db)):
    rule = db.query(TradingRule).filter(TradingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(rule, key, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(TradingRule).filter(TradingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
