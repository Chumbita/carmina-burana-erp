from fastapi import APIRouter, HTTPException, Depends, status
from src.presentation.dependencies.auth import get_current_user
from src.domain.entities.bom import Bom
from src.domain.entities.user import User
from src.domain.repositories.bom_repository import IBomRepository

bom_router= APIRouter(prefix="/bom", tags=["Bom"])

# CREATE BOM
from src.presentation.dependencies.use_cases.bom import get_create_bom_use_case
from src.presentation.schemas.bom_schemas import CreateBOMRequest, CreateBOMResponse
from src.application.use_cases.bom.create_bom import CreateBomUseCase

@bom_router.post("/boms")
async def create_bom(
    request: CreateBOMRequest,
    current_user: User= Depends(get_current_user),
    use_case: CreateBomUseCase= Depends(get_create_bom_use_case)
): 
    """
    Endpoint para crear un BOM.
    """
    
    try: 
        result= await use_case.execute(request)
        return CreateBOMResponse(
            success= True,
            data= result,
            message= "Bom creado exitosamente."    
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= CreateBOMResponse(
                success= False,
                data= None,
                message= str(e) 
            ),
        )