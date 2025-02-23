import React from "react";

const CourseProgress = ({ progress }) => {
    return (
        <div className="course-progress-container">
            <progress value={Math.floor(progress)} max="100"></progress>
            <p>{Math.floor(progress)}% completed</p>
        </div>
    );
};

export default CourseProgress;
