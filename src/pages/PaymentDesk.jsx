import React, { useEffect, useState, useRef } from "react";

const PaymentDesk = () => {
    const [paymentReceipt, setPaymentReceipt] = useState({
        orderId: "",
        orderDateTime: "",
        productDetailList: [],
    });
    const [loading, setLoading] = useState(true);
    const wsPayment = useRef(null);

    const SERVER_IP = "192.168.67.240";

    const payCartItemList = async (orderId) => {
        try {
            const response = await fetch(
                `http://${SERVER_IP}:8080/api/paymentDesk/payment/${orderId}`
                ,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                alert("결제 완료!");
                console.log("결제 완료!");
                const completedMessage = JSON.stringify({status: "completed"});
                wsPayment.current.send(completedMessage);
                await stopSensor();
            } else {
                alert("결제 시도 중 실패!");
                console.log("결제 시도 중 실패!");
            }
        } catch (error) {
            alert(`에러 발생: ${error}`);
            console.log(`에러 발생: ${error}`);
        }
    }

    const stopSensor = async () => {
        try {
            const response = await fetch(
                `http:/${SERVER_IP}:8080/api/paymentDesk/stop-sensor`
                ,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                alert("센서가 꺼졌습니다.");
                console.log("센서가 꺼졌습니다.");
            } else {
                alert("센서가 꺼지지 않았습니다.");
                console.log("센서가 꺼지지 않았습니다.");
            }
        } catch (error) {
            alert(`에러 발생: ${error}`);
            console.log(`에러 발생: ${error}`);
        }
    }

    useEffect(() => {
        wsPayment.current = new WebSocket(`ws://${SERVER_IP}:8080/ws/shopping?clientId=CLIENT_PAYMENTDESK`);

        wsPayment.current.onopen = () => console.log("WebSocket 연결 성공");
        wsPayment.current.onmessage = (e) => {
            try {
                const paymentReceiptJson = JSON.parse(e.data);
                setPaymentReceipt(paymentReceiptJson);
                console.log(paymentReceiptJson)
                setLoading(false);
            } catch (err) {
                console.error("JSON 파싱 오류: ", err);
            }
        };
        wsPayment.current.onclose = () => console.log("WebSocket 연결 종료");
        wsPayment.current.onerror = (err) => console.error("WebSocket 오류: ", err);

        return () => {
            if (wsPayment.current) wsPayment.current.close();
        };
    }, []);

    return (
        <div>
            <h1>PaymentDesk Page</h1>
            {loading ? <p>로딩 중...</p> : (
                <>
                    <p>{paymentReceipt.orderId}</p>
                    <p>{paymentReceipt.orderDateTime}</p>
                    <ul>
                        {paymentReceipt.productDetailList.length > 0 ? (
                            paymentReceipt.productDetailList.map((product) => (
                                <li style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "10px",
                                    fontSize: "14px"
                                    }} key={product.productId}>
                                    <span style={{display: "block"}}>{product.productName}</span>
                                    <span style={{display: "block"}}>{product.productPrice}</span>
                                    <span style={{display: "block"}}>{product.quantity}</span>
                                    <span style={{display: "block"}}>{product.quantity * product.productPrice}원</span>
                                </li>
                            ))
                        ) : (
                            <p>No products found.</p>
                        )}
                    </ul>
                    <div>
                        <div>
                            <span>수량</span>
                            <span>
                                {paymentReceipt.productDetailList.reduce((quantitySum, productDetail) => (
                                    quantitySum += productDetail.quantity
                            ), 0)}
                            </span>
                        </div>
                        <div>
                            <span>총 결제금액</span>
                            <span>
                            {paymentReceipt.productDetailList.reduce((priceSum, productDetail) => (
                                    priceSum += (productDetail.quantity * productDetail.productPrice)
                            ), 0)}
                            </span>
                        </div>
                    </div>
                </>
            )}
            <div>
                <button 
                style={{
                    "background": "red"
                }}
                onClick={() => payCartItemList(paymentReceipt.orderId)}
                >확인</button>
            </div>
        </div>
    );
};

export default PaymentDesk;