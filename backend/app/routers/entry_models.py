from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import EntryModel
from app.schemas import EntryModelCreate, EntryModelUpdate, EntryModelResponse

router = APIRouter(prefix="/api/entry-models", tags=["entry-models"])


@router.get("", response_model=list[EntryModelResponse])
def get_entry_models(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(EntryModel)
    if active_only:
        query = query.filter(EntryModel.is_active.is_(True))
    return query.all()


@router.get("/{model_id}", response_model=EntryModelResponse)
def get_entry_model(model_id: int, db: Session = Depends(get_db)):
    model = db.query(EntryModel).filter(EntryModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Entry model not found")
    return model


@router.post("", response_model=EntryModelResponse, status_code=201)
def create_entry_model(data: EntryModelCreate, db: Session = Depends(get_db)):
    model = EntryModel(**data.model_dump())
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


@router.put("/{model_id}", response_model=EntryModelResponse)
def update_entry_model(model_id: int, data: EntryModelUpdate, db: Session = Depends(get_db)):
    model = db.query(EntryModel).filter(EntryModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Entry model not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(model, key, value)
    db.commit()
    db.refresh(model)
    return model


@router.delete("/{model_id}", status_code=204)
def delete_entry_model(model_id: int, db: Session = Depends(get_db)):
    model = db.query(EntryModel).filter(EntryModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Entry model not found")
    db.delete(model)
    db.commit()
