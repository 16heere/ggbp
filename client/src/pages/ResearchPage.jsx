import React from "react";
import { UserContext } from "../context/userContext";
const ResearchPage = () => {
    const { user } = useContext(UserContext);
    return (
        <div className="research-page">
            <h1>News</h1>
        </div>
    );
};

export default ResearchPage;
