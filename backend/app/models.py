from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, Boolean,
    ForeignKey, Enum as SAEnum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class TradeDirection(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class TradeStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    ticket = Column(String(50), unique=True, index=True, nullable=True)
    symbol = Column(String(20), nullable=False, index=True)
    direction = Column(SAEnum(TradeDirection), nullable=False)
    volume = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    profit = Column(Float, nullable=True, default=0)
    commission = Column(Float, nullable=True, default=0)
    swap = Column(Float, nullable=True, default=0)
    status = Column(SAEnum(TradeStatus), default=TradeStatus.OPEN, index=True)
    open_time = Column(DateTime, nullable=False)
    close_time = Column(DateTime, nullable=True)
    strategy = Column(String(100), nullable=True, index=True)
    setup_type = Column(String(100), nullable=True)
    timeframe = Column(String(10), nullable=True)
    risk_reward = Column(Float, nullable=True)
    risk_percent = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True, default=list)
    rating = Column(Integer, nullable=True)
    is_mt5_synced = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    screenshots = relationship("TradeScreenshot", back_populates="trade", cascade="all, delete-orphan")
    journal_entry = relationship("JournalEntry", back_populates="trade", uselist=False, cascade="all, delete-orphan")


class TradeScreenshot(Base):
    __tablename__ = "trade_screenshots"

    id = Column(Integer, primary_key=True, index=True)
    trade_id = Column(Integer, ForeignKey("trades.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    label = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    trade = relationship("Trade", back_populates="screenshots")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    trade_id = Column(Integer, ForeignKey("trades.id", ondelete="CASCADE"), nullable=True, unique=True)
    date = Column(DateTime, nullable=False, index=True)
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    emotions = Column(String(100), nullable=True)
    market_conditions = Column(String(200), nullable=True)
    lessons_learned = Column(Text, nullable=True)
    mistakes = Column(Text, nullable=True)
    daily_grade = Column(String(5), nullable=True)
    rules_followed = Column(Boolean, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    trade = relationship("Trade", back_populates="journal_entry")


class EntryModel(Base):
    __tablename__ = "entry_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    timeframe = Column(String(10), nullable=True)
    conditions = Column(JSON, nullable=True, default=list)
    entry_rules = Column(Text, nullable=True)
    exit_rules = Column(Text, nullable=True)
    stop_loss_rules = Column(Text, nullable=True)
    take_profit_rules = Column(Text, nullable=True)
    risk_per_trade = Column(Float, nullable=True)
    screenshot_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    win_rate = Column(Float, nullable=True)
    total_trades = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class TradingAccount(Base):
    __tablename__ = "trading_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, default="Account A")
    balance = Column(Float, nullable=False, default=0)
    equity = Column(Float, nullable=False, default=0)
    currency = Column(String(10), default="USD")
    leverage = Column(String(20), nullable=True)
    server = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    color = Column(String(20), default="#338bff")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class AccountInfo(Base):
    __tablename__ = "account_info"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("trading_accounts.id", ondelete="SET NULL"), nullable=True)
    balance = Column(Float, nullable=False, default=0)
    equity = Column(Float, nullable=False, default=0)
    margin = Column(Float, nullable=True, default=0)
    free_margin = Column(Float, nullable=True, default=0)
    margin_level = Column(Float, nullable=True)
    profit = Column(Float, nullable=True, default=0)
    leverage = Column(String(20), nullable=True)
    currency = Column(String(10), default="USD")
    server = Column(String(100), nullable=True)
    login = Column(String(50), nullable=True)
    synced_at = Column(DateTime, server_default=func.now())


class TradingRule(Base):
    __tablename__ = "trading_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    max_daily_loss = Column(Float, nullable=True)
    max_daily_trades = Column(Integer, nullable=True)
    max_position_size = Column(Float, nullable=True)
    max_risk_per_trade = Column(Float, nullable=True)
    allowed_sessions = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class EdgePlan(Base):
    __tablename__ = "edge_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    subtitle = Column(String(200), nullable=True)
    plan_type = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_preset = Column(Boolean, default=False)
    color = Column(String(20), default="#ef4444")
    trades_taken = Column(Integer, default=0)
    win_rate = Column(Float, default=0)
    net_pnl = Column(Float, default=0)
    compliance = Column(Float, default=0)
    max_trades_per_day = Column(Integer, nullable=True)
    max_daily_loss = Column(Float, nullable=True)
    max_daily_profit = Column(Float, nullable=True)
    risk_per_trade = Column(Float, nullable=True)
    trading_window_start = Column(String(10), nullable=True)
    trading_window_end = Column(String(10), nullable=True)
    trading_window_tz = Column(String(20), default="UTC")
    charting_process = Column(JSON, nullable=True, default=list)
    entry_criteria = Column(JSON, nullable=True, default=list)
    entry_model_screenshots = Column(JSON, nullable=True, default=list)
    trade_management_rules = Column(Text, nullable=True)
    exit_criteria = Column(Text, nullable=True)
    trading_notes = Column(JSON, nullable=True, default=list)
    last_reviewed = Column(DateTime, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class DailyStats(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False, unique=True, index=True)
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    gross_profit = Column(Float, default=0)
    gross_loss = Column(Float, default=0)
    net_pnl = Column(Float, default=0)
    win_rate = Column(Float, default=0)
    profit_factor = Column(Float, nullable=True)
    max_drawdown = Column(Float, default=0)
    balance_eod = Column(Float, nullable=True)
    equity_eod = Column(Float, nullable=True)
    rules_followed = Column(Boolean, nullable=True)
    notes = Column(Text, nullable=True)
