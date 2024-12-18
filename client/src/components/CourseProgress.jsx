import React from "react";

const CourseProgress = ({ progress }) => {
    return (
        <div>
            <h3 className="course-progress-title">Course Progress</h3>
            <div>
                <progress value={Math.floor(progress)} max="100"></progress>
                <p>{Math.floor(progress)}% completed</p>
            </div>
        </div>
    );
};

export default CourseProgress;
