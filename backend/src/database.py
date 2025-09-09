from bson import ObjectId

class CourseDAL:
    def __init__(self, collection):
        self.collection = collection

    async def create_course(self, title: str):
        await self.collection.insert_one({
            "title": title,
            "tasks": [
                {
                    "task": "Test",
                    "done": False
                }
            ]
        })

    async def get_all_courses(self):
        courses = []
        cursor = self.collection.find()
        async for doc in cursor:
            courses.append({
                "id": str(doc["_id"]), 
                "title": doc.get("title", ""),
                "tasks": doc.get("tasks", [])
            })
        return courses
    
    async def add_task(self, id: str, name: str):
        await self.collection.find_one_and_update(
            {"_id" : ObjectId(id)},
            {
                "$push": {
                    "tasks": {
                        "task": name,
                        "done": False,
                    }
                }
            }

        )