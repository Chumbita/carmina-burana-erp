# Backend Carmina Burana ERP

## Estructura de carpetas
```bash
backend/
├── src/
│   ├── presentation/             # Puerta de entrada al backend.   
│   │   ├── api/                  # Estructura de la API.
│   │   │   ├── routers/          # Endpoints organizados por módulo funcional.
│   │   ├── schemas/              # Modelos Pydantic que definen la estructura de requests y responses.
│   │   ├── dependencies/         # Funciones de inyección de dependencias de FastAPI.
│   │   └── middleware/           # Middlewares personalizados.
│   ├── application/              # Lógica de negocio.
│   │   ├── use_cases/            # Todos los caso de uso del sistema organizado por módulo.
│   │   │   └── use_case_x/
│   │   └── interfaces/           # Interfaces (Servicios que la aplicación necesita pero que serán implementados en infraestructura.).
│   │       └── services.py
│   ├── domain/                   # Núcleo de la lógica de negocio.
│   │   ├── entities/             # Entidades del dominio.
│   │   ├── value_objects/        # Objetos inmutables que se definen por sus valores y contienen validaciones.
│   │   ├── repositories/         # Interfaces de los repositorios.
│   │   └── services/             # Interfaces de servicios de dominio que coordinan lógica que no pertenece naturalmente a una sola entidad.

│   ├── infrastructure/           # Implementaciones técnicas y detalles de bajo nivel.
│   │   ├── database/             
│   │   │   ├── models/           # Modelos de SQLAlchemy que representan las tablas de la base de datos.
│   │   │   ├── repositories/     # Implementaciones concretas de los repositorios definidos en el dominio.
│   │   │   ├── session.py
│   │   │   └── base.py
│   │   ├── services/             # Implementaciones concretas de servicios externos.
│   │   ├── security/             # Utilidades de seguirdad.
│   │   └── config/               # Configuración centralizada del sistema. 

│   ├── shared/                   # Contiene código utilitario que se usa transversalmente en todas las capas. Solo debe haber aquí funciones verdaderamente genéricas que no pertenecen a ninguna capa específica.
│   │   ├── __init__.py
│   │   ├── utils.py
│   │   └── constants.py
│   └── main.py
├── run.py                        # Archivo de ejecución principal. 
├── .env                          # Variable de entorno.
├── .env.example                  # Plantilla de variables de entorno.
├── requirements.txt              # Requerimientos del sistema. 
```

## Instalar dependencias
1. Activá el entorno virtual.
2. Ejecutá `pip install -r requirements.txt`

## Actualizar dependencias
En caso de que instales nuevas independencias, para actualizar el archvio `requirements.txt`, debes ejecutar `pip freeze > requirements.txt`

## Lanzar programa
Ejecutá `python run.py`

## Alembic y migraciones
Una vez que hayas creado tus modelos en `src/infrastructure/database/models`, hay que importarlos en Alembic en el archivo `alembic/env.py` --> `from src.infrastructure.database.models import tu_modelo` 

Ahora deben serguir los siguientes pasos para generar la migración. En la consola:
1. Generar la migración  
`alembic revision --autogenerate -m "comentario_de_migración"`  
Esto te va a generar automáticamente un archivo en `alembic/versions`.  

2. Tenés que verificar que el archivo generado se haya generado correctamente con las especificacioes en tu modelo. En caso de haber inconsistencia debes corregirlas.  

3. Aplicar la migración  
`alembic upgrade head`  

4. Verificar que la o las tablas se hayan generado en la base de datos.