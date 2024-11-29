import React, { useEffect, useState } from "react";

const PaymentDesk = () => {
    const [paymentRecipt, setPaymentRecipt] = useState({
        orderId: "",
        orderDateTime: "",
        productDetailList: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const clientId = "4bafc367";
        const ws = new WebSocket(`ws://192.168.170.240:8080/ws/rfid?clientId=${clientId}`);

        ws.onopen = () => console.log("WebSocket 연결 성공");
        ws.onmessage = (e) => {
            try {
                const paymentReciptJson = JSON.parse(e.data);
                setPaymentRecipt(paymentReciptJson);
                setLoading(false);
            } catch (err) {
                console.error("JSON 파싱 오류: ", err);
            }
        };
        ws.onclose = () => console.log("WebSocket 연결 종료");
        ws.onerror = (err) => console.error("WebSocket 오류: ", err);

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, []);

    return (
        <div>
            <h1>PaymentDesk Page</h1>
            {loading ? <p>로딩 중...</p> : (
                <>
                    <p>{paymentRecipt.orderId}</p>
                    <p>{paymentRecipt.orderDateTime}</p>
                    <ul>
                        {paymentRecipt.productDetailList.length > 0 ? (
                            paymentRecipt.productDetailList.map((product) => (
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
                                {paymentRecipt.productDetailList.reduce((quantitySum, productDetail) => (
                                    quantitySum += productDetail.quantity
                            ), 0)}
                            </span>
                        </div>
                        <div>
                            <span>총 결제금액</span>
                            <span>
                            {paymentRecipt.productDetailList.reduce((priceSum, productDetail) => (
                                    priceSum += (productDetail.quantity * productDetail.productPrice)
                            ), 0)}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentDesk;