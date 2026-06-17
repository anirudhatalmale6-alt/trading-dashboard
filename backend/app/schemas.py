from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TradeCreate(BaseModel):
    ticket: Optional[str] = None
    symbol: str
    direction: str
    volume: float
    entry_price: float
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    profit: Optional[float] = 0
    commission: Optional[float] = 0
    swap: Optional[float] = 0
    status: str = "OPEN"
    open_time: datetime
    close_time: Optional[datetime] = None
    strategy: Optional[str] = None
    setup_type: Optional[str] = None
    timeframe: Optional[str] = None
    risk_reward: Optional[float] = None
    risk_percent: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[list] = []
    rating: Optional[int] = None


class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    direction: Optional[str] = None
    volume: Optional[float] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    profit: Optional[float] = None
    commission: Optional[float] = None
    swap: Optional[float] = None
    status: Optional[str] = None
    open_time: Optional[datetime] = None
    close_time: Optional[datetime] = None
    strategy: Optional[str] = None
    setup_type: Optional[str] = None
    timeframe: Optional[str] = None
    risk_reward: Optional[float] = None
    risk_percent: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[list] = None
    rating: Optional[int] = None


class TradeResponse(BaseModel):
    id: int
    ticket: Optional[str]
    symbol: str
    direction: str
    volume: float
    entry_price: float
    exit_price: Optional[float]
    stop_loss: Optional[float]
    take_profit: Optional[float]
    profit: Optional[float]
    commission: Optional[float]
    swap: Optional[float]
    status: str
    open_time: datetime
    close_time: Optional[datetime]
    strategy: Optional[str]
    setup_type: Optional[str]
    timeframe: Optional[str]
    risk_reward: Optional[float]
    risk_percent: Optional[float]
    notes: Optional[str]
    tags: Optional[list]
    rating: Optional[int]
    is_mt5_synced: bool
    created_at: datetime
    screenshots: list = []

    class Config:
        from_attributes = True


class JournalCreate(BaseModel):
    trade_id: Optional[int] = None
    date: datetime
    title: Optional[str] = None
    content: Optional[str] = None
    emotions: Optional[str] = None
    market_conditions: Optional[str] = None
    lessons_learned: Optional[str] = None
    mistakes: Optional[str] = None
    daily_grade: Optional[str] = None
    rules_followed: Optional[bool] = None


class JournalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    emotions: Optional[str] = None
    market_conditions: Optional[str] = None
    lessons_learned: Optional[str] = None
    mistakes: Optional[str] = None
    daily_grade: Optional[str] = None
    rules_followed: Optional[bool] = None


class JournalResponse(BaseModel):
    id: int
    trade_id: Optional[int]
    date: datetime
    title: Optional[str]
    content: Optional[str]
    emotions: Optional[str]
    market_conditions: Optional[str]
    lessons_learned: Optional[str]
    mistakes: Optional[str]
    daily_grade: Optional[str]
    rules_followed: Optional[bool]
    created_at: datetime

    class Config:
        from_attributes = True


class EntryModelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    timeframe: Optional[str] = None
    conditions: Optional[list] = []
    entry_rules: Optional[str] = None
    exit_rules: Optional[str] = None
    stop_loss_rules: Optional[str] = None
    take_profit_rules: Optional[str] = None
    risk_per_trade: Optional[float] = None
    screenshot_url: Optional[str] = None
    is_active: bool = True


class EntryModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    timeframe: Optional[str] = None
    conditions: Optional[list] = None
    entry_rules: Optional[str] = None
    exit_rules: Optional[str] = None
    stop_loss_rules: Optional[str] = None
    take_profit_rules: Optional[str] = None
    risk_per_trade: Optional[float] = None
    screenshot_url: Optional[str] = None
    is_active: Optional[bool] = None


class EntryModelResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    timeframe: Optional[str]
    conditions: Optional[list]
    entry_rules: Optional[str]
    exit_rules: Optional[str]
    stop_loss_rules: Optional[str]
    take_profit_rules: Optional[str]
    risk_per_trade: Optional[float]
    screenshot_url: Optional[str]
    is_active: bool
    win_rate: Optional[float]
    total_trades: int
    created_at: datetime

    class Config:
        from_attributes = True


class AccountInfoResponse(BaseModel):
    id: int
    balance: float
    equity: float
    margin: Optional[float]
    free_margin: Optional[float]
    margin_level: Optional[float]
    profit: Optional[float]
    leverage: Optional[str]
    currency: str
    server: Optional[str]
    synced_at: datetime

    class Config:
        from_attributes = True


class TradingRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True
    max_daily_loss: Optional[float] = None
    max_daily_trades: Optional[int] = None
    max_position_size: Optional[float] = None
    max_risk_per_trade: Optional[float] = None
    allowed_sessions: Optional[list] = None


class TradingRuleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    is_active: bool
    max_daily_loss: Optional[float]
    max_daily_trades: Optional[int]
    max_position_size: Optional[float]
    max_risk_per_trade: Optional[float]
    allowed_sessions: Optional[list]
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    balance: float = 0
    equity: float = 0
    daily_pnl: float = 0
    total_trades: int = 0
    open_positions: int = 0
    win_rate: float = 0
    profit_factor: Optional[float] = None
    max_drawdown: float = 0
    best_trade: float = 0
    worst_trade: float = 0
    avg_win: float = 0
    avg_loss: float = 0
    total_profit: float = 0
    streak: int = 0
    equity_curve: list = []
    recent_trades: list = []
    daily_stats: list = []


class MT5SyncData(BaseModel):
    account_info: dict
    positions: list = []
    history: list = []
