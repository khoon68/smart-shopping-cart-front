import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div>
            <h1>Home Page</h1>
            <ul>
                <li><Link to="/setting">초기세팅 페이지로</Link></li>
                <li><Link to="/payment-desk">계산대 페이지로</Link></li>
                <li><Link to="/cart">카트 페이지로</Link></li>
            </ul>
        </div>
    );
}

export default Home;