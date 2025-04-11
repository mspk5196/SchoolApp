import { useState } from "react";

const Datas = () => {
    const [questions, setQuestions] = useState([
        { id: 1, question: "How clear and understandable do you find the faculty's teaching methods?", answer: "" },
        { id: 2, question: "How clear and understandable are the materials provided by the faculty?", answer: "" },
        { id: 3, question: "How effectively is time allocated and managed in all activities?", answer: "" },
        { id: 4, question: "How satisfied are you with this course overall?", answer: "" },
    ]);

    const updateAnswer = (id, answer) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map(q => q.id === id ? { ...q, answer } : q)
        );
    };

    const logFinalResponses = (generalComments) => {
        console.log("Final Survey Responses:", questions);
        // console.log("General Comments:", generalComments); dont use this for now
    };

    return { questions, updateAnswer, logFinalResponses };
};

export default Datas;
