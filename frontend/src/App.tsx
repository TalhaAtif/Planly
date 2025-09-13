import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="App">
      <h1>Courses</h1>
      <pre>{JSON.stringify(courses, null, 2)}</pre>
    </div>
  );
}

export default App;
