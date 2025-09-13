// frontend/src/CourseManager.js
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Task {
  task: string;
  done: boolean;
}

interface Course {
  id: string;
  title: string;
  tasks: Task[];
}

function CourseManager() {
  const [title, setTitle] = useState<string>("");
  const [taskInputs, setTaskInputs] = useState<{ [key: string]: string }>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState<string>("");

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  const addTask = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    const task = taskInputs[courseId];
    if (!task) return;

    try {
      await axios.post("/api/courses/task", { courseId: courseId, name: task, });
      setTaskInputs({...taskInputs, [courseId]: "" })
      fetchCourses();
    } catch (err) {
      console.error("Could not add task", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Add new course
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/courses", { title });
      setTitle("");
      fetchCourses(); // Refresh list after adding
    } catch (err) {
      setMessage("Error adding course");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          value={title}
          placeholder="Add new course"
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "150px", padding: "0.5rem" }}
        />
        <button type="submit" style={{ marginTop: "0.5rem" }}>
          +
        </button>
      </form>

      <p>{message}</p>

      <h2>Courses</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 400px))",
          gap: "1rem",
        }}
      >
        {courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          courses.map(( course ) => (
            <div className="course-card" key={course.id}>
              <h3>{course.title}</h3>
              <div>
                {course.tasks.map((task, index) => (
                  <div className="task-item" key={index}>
                    <strong>{task.task}</strong>
                    <input type="checkbox" checked={task.done} readOnly />
                  </div>
                ))}
              </div>
              <div className="new-task-input">

                <form onSubmit={(e) => addTask(e, course.id)} style={{ marginBottom: "1rem" }}>
                  <input
                    type="text"
                    value={taskInputs[course.id] || ""}
                    placeholder="Add new task"
                    onChange={(e) => setTaskInputs({...taskInputs, [course.id]: e.target.value})}
                    required
                    style={{ minWidth: "170px", maxWidth: "320px" }}
                  />
                  <button type="submit" style={{ marginTop: "1rem" }}>
                    +
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CourseManager;
