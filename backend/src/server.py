# backend/src/server.py
import os
import sys

from contextlib import asynccontextmanager

from fastapi import FastAPI, status, Request
from pydantic import BaseModel
import uvicorn

from database import CourseDAL
from motor.motor_asyncio import AsyncIOMotorClient

DEBUG = os.environ.get("DEBUG", "").strip().lower() in {"1", "true", "on", "yes"}

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
    db = client.get_default_database()

    linked = await db.command("ping")
    if int(linked["ok"]) != 1:
        raise Exception("Cluster connection issue.")
    
    app.state.db_controller = CourseDAL(db.get_collection("courses"))

    yield

    client.close()

app = FastAPI(lifespan=lifespan, debug = DEBUG)

class NewCourse(BaseModel):
    title: str

class CourseResponse(BaseModel):
    id: str
    title: str
    tasks: list

class NewTask(BaseModel):
    courseId: str
    name: str

@app.post("/api/courses", status_code=status.HTTP_201_CREATED)
async def create_course(new_course: NewCourse, request: Request):
    await request.app.state.db_controller.create_course(new_course.title)

@app.get("/api/courses", response_model=list[CourseResponse])
async def list_courses(request: Request):
    return await request.app.state.db_controller.get_all_courses()

@app.post("/api/courses/task", status_code=status.HTTP_201_CREATED)
async def add_task(new_task: NewTask, request: Request):
    await request.app.state.db_controller.add_task(new_task.courseId, new_task.name)

def main(argv=sys.argv[1:]):
    try:
        uvicorn.run("server:app", host="0.0.0.0", port=3001, reload=DEBUG)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()