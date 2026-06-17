from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models import TradingAccount

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


class AccountCreate(BaseModel):
    name: str = "New Account"
    balance: float = 0
    equity: float = 0
    currency: str = "USD"
    leverage: Optional[str] = None
    server: Optional[str] = None
    color: str = "#338bff"


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    balance: Optional[float] = None
    equity: Optional[float] = None
    currency: Optional[str] = None
    leverage: Optional[str] = None
    server: Optional[str] = None
    is_active: Optional[bool] = None
    color: Optional[str] = None


@router.get("")
def get_accounts(db: Session = Depends(get_db)):
    accounts = db.query(TradingAccount).order_by(TradingAccount.created_at).all()
    if not accounts:
        default = TradingAccount(name="Account A", balance=0, equity=0, color="#338bff")
        db.add(default)
        db.commit()
        db.refresh(default)
        accounts = [default]
    return [_to_dict(a) for a in accounts]


@router.post("", status_code=201)
def create_account(data: AccountCreate, db: Session = Depends(get_db)):
    account = TradingAccount(**data.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return _to_dict(account)


@router.put("/{account_id}")
def update_account(account_id: int, data: AccountUpdate, db: Session = Depends(get_db)):
    account = db.query(TradingAccount).filter(TradingAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(account, key, value)
    db.commit()
    db.refresh(account)
    return _to_dict(account)


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(TradingAccount).filter(TradingAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()


def _to_dict(a):
    return {
        "id": a.id, "name": a.name, "balance": a.balance, "equity": a.equity,
        "currency": a.currency, "leverage": a.leverage, "server": a.server,
        "is_active": a.is_active, "color": a.color,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }
